variable "function_name" {
  description = "Lambda function name."
  type        = string
}

variable "source_dir" {
  description = "Directory whose contents (index.mjs etc.) get zipped into the deployment package."
  type        = string
}

variable "memory_mb" {
  description = "Memory allocation in MB."
  type        = number
}

variable "timeout_seconds" {
  description = "Function timeout in seconds."
  type        = number
}

variable "anthropic_secret" {
  description = "Secrets Manager ARN holding the Anthropic API key."
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
}
