data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security group attached to whatever runs Symfony (EC2/ECS/Fargate).
# Operators attach this SG to the app instances; RDS allows ingress from it.
resource "aws_security_group" "app" {
  name        = "${local.name_prefix}-app"
  description = "Symfony application instances. Attach to EC2/ECS tasks."
  vpc_id      = data.aws_vpc.default.id

  egress {
    description = "Allow all outbound (Lambda invoke, RDS, S3, Secrets Manager)."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "secrets" {
  source = "./modules/secrets"

  name_prefix       = local.name_prefix
  anthropic_api_key = var.anthropic_api_key
}

module "s3" {
  source = "./modules/s3"

  bucket_name = "${local.name_prefix}-photos"
}

module "rds" {
  source = "./modules/rds"

  name_prefix              = local.name_prefix
  vpc_id                   = data.aws_vpc.default.id
  subnet_ids               = data.aws_subnets.default.ids
  app_security_group_id    = aws_security_group.app.id
  instance_class           = var.db_instance_class
  allocated_storage        = var.db_allocated_storage
  multi_az                 = var.db_multi_az
  backup_retention_days    = var.db_backup_retention_days
  db_password_secret_arn   = module.secrets.db_password_secret_arn
  db_password_secret_value = module.secrets.db_password_value
}

module "lambda_story_generator" {
  source = "./modules/lambda"

  function_name      = "${local.name_prefix}-story-generator"
  source_dir         = "${path.module}/../lambdas/dist/story-generator"
  memory_mb          = var.lambda_memory_mb
  timeout_seconds    = var.lambda_timeout_seconds
  anthropic_secret   = module.secrets.anthropic_api_key_secret_arn
  log_retention_days = local.env == "prod" ? 30 : 7
}

module "lambda_go_deeper" {
  source = "./modules/lambda"

  function_name      = "${local.name_prefix}-go-deeper"
  source_dir         = "${path.module}/../lambdas/dist/go-deeper"
  memory_mb          = var.lambda_memory_mb
  timeout_seconds    = var.lambda_timeout_seconds
  anthropic_secret   = module.secrets.anthropic_api_key_secret_arn
  log_retention_days = local.env == "prod" ? 30 : 7
}

module "cloudfront" {
  source = "./modules/cloudfront"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  name_prefix         = local.name_prefix
  bucket_name         = module.s3.bucket_name
  bucket_arn          = module.s3.bucket_arn
  bucket_domain_name  = module.s3.bucket_regional_domain_name
  price_class         = var.cloudfront_price_class
  default_ttl_seconds = var.cloudfront_default_ttl_seconds
  custom_domain_name  = var.cdn_domain_name
}

# Symfony's IAM role: allow it to invoke the two Lambdas, put objects in S3,
# and read both secrets. Attach this role to the EC2 instance / ECS task.
data "aws_iam_policy_document" "symfony_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = [
        "ec2.amazonaws.com",
        "ecs-tasks.amazonaws.com",
      ]
    }
  }
}

resource "aws_iam_role" "symfony" {
  name               = "${local.name_prefix}-symfony"
  assume_role_policy = data.aws_iam_policy_document.symfony_assume_role.json
}

data "aws_iam_policy_document" "symfony" {
  statement {
    sid     = "InvokeLambdas"
    actions = ["lambda:InvokeFunction"]
    resources = [
      module.lambda_story_generator.function_arn,
      module.lambda_go_deeper.function_arn,
    ]
  }

  statement {
    sid       = "PhotoBucketWrite"
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["${module.s3.bucket_arn}/*"]
  }

  statement {
    sid       = "ReadSecrets"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [module.secrets.anthropic_api_key_secret_arn, module.secrets.db_password_secret_arn]
  }
}

resource "aws_iam_role_policy" "symfony" {
  name   = "${local.name_prefix}-symfony"
  role   = aws_iam_role.symfony.id
  policy = data.aws_iam_policy_document.symfony.json
}

resource "aws_iam_instance_profile" "symfony" {
  name = "${local.name_prefix}-symfony"
  role = aws_iam_role.symfony.name
}
