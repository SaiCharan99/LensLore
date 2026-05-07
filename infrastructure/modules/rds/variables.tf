variable "name_prefix" {
  description = "Prefix for resource names."
  type        = string
}

variable "vpc_id" {
  description = "VPC the DB lives in."
  type        = string
}

variable "subnet_ids" {
  description = "Subnets for the DB subnet group. Must span ≥2 AZs."
  type        = list(string)
}

variable "app_security_group_id" {
  description = "SG attached to the Symfony app. RDS allows ingress on 5432 from this SG."
  type        = string
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
}

variable "allocated_storage" {
  description = "Storage in GiB."
  type        = number
}

variable "multi_az" {
  description = "Multi-AZ deployment."
  type        = bool
}

variable "backup_retention_days" {
  description = "Number of days for automated backup retention."
  type        = number
}

variable "db_password_secret_arn" {
  description = "Secrets Manager ARN holding the master password (for tagging/reference)."
  type        = string
}

variable "db_password_secret_value" {
  description = "Master password value pulled from Secrets Manager and passed to RDS."
  type        = string
  sensitive   = true
}
