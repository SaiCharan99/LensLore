variable "name_prefix" {
  description = "Prefix for resource names."
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name (origin)."
  type        = string
}

variable "bucket_arn" {
  description = "S3 bucket ARN."
  type        = string
}

variable "bucket_domain_name" {
  description = "Regional domain name of the S3 bucket."
  type        = string
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 = NA+EU only."
  type        = string
}

variable "default_ttl_seconds" {
  description = "Default cache TTL."
  type        = number
}

variable "custom_domain_name" {
  description = "Optional custom domain. Null skips ACM cert + alias setup."
  type        = string
  default     = null
}
