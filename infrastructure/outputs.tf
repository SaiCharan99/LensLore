output "s3_bucket_name" {
  description = "S3 bucket holding photos. Set as backend AWS_S3_BUCKET."
  value       = module.s3.bucket_name
}

output "rds_endpoint" {
  description = "RDS endpoint (host:port). Build DATABASE_URL from this and the username/password secret."
  value       = module.rds.endpoint
}

output "rds_database_name" {
  description = "Database name created on the RDS instance."
  value       = module.rds.database_name
}

output "rds_username" {
  description = "RDS master username."
  value       = module.rds.username
}

output "story_lambda_arn" {
  description = "ARN of the story-generator Lambda. Set as LAMBDA_STORY_ARN."
  value       = module.lambda_story_generator.function_arn
}

output "go_deeper_lambda_arn" {
  description = "ARN of the go-deeper Lambda. Set as LAMBDA_GO_DEEPER_ARN."
  value       = module.lambda_go_deeper.function_arn
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain. Use this as the frontend image base URL."
  value       = module.cloudfront.distribution_domain
}

output "anthropic_api_key_secret_arn" {
  description = "Secret ARN for the Anthropic API key. Lambdas read this at runtime."
  value       = module.secrets.anthropic_api_key_secret_arn
}

output "db_password_secret_arn" {
  description = "Secret ARN for the RDS master password."
  value       = module.secrets.db_password_secret_arn
}

output "symfony_iam_role_arn" {
  description = "Attach to the EC2 instance / ECS task running Symfony."
  value       = aws_iam_role.symfony.arn
}

output "symfony_security_group_id" {
  description = "Attach to the EC2/ECS network interface so RDS lets it through."
  value       = aws_security_group.app.id
}
