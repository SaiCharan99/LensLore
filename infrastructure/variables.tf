variable "project_name" {
  description = "Project name used as a prefix on all resource names."
  type        = string
  default     = "lenslore"
}

variable "aws_region" {
  description = "AWS region for the primary stack."
  type        = string
  default     = "eu-west-1"
}

variable "db_instance_class" {
  description = "RDS instance class. Use db.t3.micro in dev, db.t3.medium in prod."
  type        = string
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GiB."
  type        = number
}

variable "db_multi_az" {
  description = "Whether RDS runs Multi-AZ. true in prod, false in dev."
  type        = bool
}

variable "db_backup_retention_days" {
  description = "Number of days RDS keeps automated backups."
  type        = number
}

variable "lambda_memory_mb" {
  description = "Memory allocation for both Lambda functions, in MB."
  type        = number
  default     = 512
}

variable "lambda_timeout_seconds" {
  description = "Lambda timeout. Claude vision calls can take ~15s; allow headroom."
  type        = number
  default     = 30
}

variable "cloudfront_price_class" {
  description = "CloudFront price class. PriceClass_100 = NA+EU only (cheap)."
  type        = string
}

variable "cloudfront_default_ttl_seconds" {
  description = "CloudFront default TTL in seconds."
  type        = number
}

variable "cdn_domain_name" {
  description = "Optional custom domain for CloudFront (e.g. cdn.lenslore.com). Null = use default CloudFront domain."
  type        = string
  default     = null
}

variable "anthropic_api_key" {
  description = "Anthropic API key. Pass via env var TF_VAR_anthropic_api_key — never commit to a tfvars file."
  type        = string
  sensitive   = true
  default     = ""
}
