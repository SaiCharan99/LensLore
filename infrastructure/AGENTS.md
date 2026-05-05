# Infrastructure — Agent Orientation

Terraform on AWS. **Phase 4 — not started yet.**

This directory is empty. Build it here.

---

## What to provision

| Resource | Purpose |
|----------|---------|
| S3 bucket | Image storage (`lenslore-photos-{env}`) |
| RDS PostgreSQL | Database for albums, photos, stories, messages |
| Lambda functions | `story-generator` and `go-deeper` |
| API Gateway | HTTP trigger for Lambdas (or keep Symfony as the only HTTP layer) |
| CloudFront | CDN for serving images from S3 |
| IAM roles | Least-privilege roles for Lambda + Symfony EC2/ECS |
| Secrets Manager | Store `ANTHROPIC_API_KEY`, DB password |

---

## Step-by-step setup

```bash
cd infrastructure

# 1. Install Terraform 1.9+
brew install terraform   # or download from terraform.io

# 2. Configure AWS credentials
aws configure   # or set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY env vars

# 3. Initialise
terraform init

# 4. Select environment workspace
terraform workspace new dev    # first time
terraform workspace select dev

# 5. Review the plan
terraform plan -var-file=env/dev.tfvars

# 6. Apply
terraform apply -var-file=env/dev.tfvars

# 7. Get outputs (S3 bucket, RDS endpoint, Lambda ARNs, CloudFront domain)
terraform output
```

---

## File structure to create

```
infrastructure/
├── AGENTS.md                   ← this file
├── main.tf                     Provider config, backend (S3 state), workspace locals
├── variables.tf                Input variable declarations
├── outputs.tf                  S3 bucket name, RDS endpoint, Lambda ARNs, CF domain
├── env/
│   ├── dev.tfvars              dev-specific values (smaller RDS instance, etc.)
│   └── prod.tfvars             prod-specific values
└── modules/
    ├── s3/                     S3 bucket + CORS + lifecycle rules
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── rds/                    RDS PostgreSQL + subnet group + security group
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── lambda/                 Lambda function + IAM role + CloudWatch log group
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── cloudfront/             CloudFront distribution in front of S3
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── secrets/                Secrets Manager entries for API keys + DB password
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

---

## Key resource specs

### S3 bucket
```hcl
resource "aws_s3_bucket" "photos" {
  bucket = "lenslore-photos-${var.env}"
  # Block all public access — CloudFront uses OAC
}
```

### RDS
```hcl
resource "aws_db_instance" "main" {
  engine         = "postgres"
  engine_version = "15"
  instance_class = var.env == "prod" ? "db.t3.medium" : "db.t3.micro"
  # Multi-AZ only in prod
  multi_az       = var.env == "prod"
}
```

### Lambda
```hcl
resource "aws_lambda_function" "story_generator" {
  filename      = "../lambdas/dist/story-generator.zip"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  memory_size   = 512
  timeout       = 30   # Claude vision calls can take up to 15s
  environment {
    variables = {
      ANTHROPIC_API_KEY = data.aws_secretsmanager_secret_version.anthropic.secret_string
    }
  }
}
```

### CloudFront
- Origin: S3 bucket with OAC (not legacy OAI)
- Cache policy: images are immutable — 1 year TTL
- Custom domain: `cdn.lenslore.com` (add ACM cert)

---

## Terraform workspaces

- `dev` — single-AZ RDS, small instances, shorter CloudFront TTL
- `prod` — multi-AZ RDS, larger instances, full CloudFront caching

Use `${terraform.workspace}` to differentiate resource names and sizes.

---

## State backend

Store Terraform state in S3 (bootstrap this manually first — it's the one exception to "no console clicks"):

```hcl
terraform {
  backend "s3" {
    bucket = "lenslore-tf-state"
    key    = "lenslore/${terraform.workspace}/terraform.tfstate"
    region = "eu-west-1"
  }
}
```

---

## IAM principles

- Lambda execution role: only `s3:GetObject`, `s3:PutObject` on the photos bucket; `logs:CreateLogGroup`, `logs:PutLogEvents`
- Symfony server role: only `lambda:InvokeFunction` on the two Lambda ARNs; `s3:PutObject` on photos bucket
- No wildcard `*` resources in any policy
- Rotate the Anthropic API key via Secrets Manager rotation schedule

---

## Outputs needed by other phases

```
s3_bucket_name       → backend .env.local: AWS_S3_BUCKET
rds_endpoint         → backend .env.local: DATABASE_URL
story_lambda_arn     → backend .env.local: LAMBDA_STORY_ARN
go_deeper_lambda_arn → backend .env.local: LAMBDA_GO_DEEPER_ARN
cloudfront_domain    → frontend: image base URL for CDN links
```
