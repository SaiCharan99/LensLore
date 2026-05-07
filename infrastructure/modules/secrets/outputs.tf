output "db_password_secret_arn" {
  description = "ARN of the RDS master password secret."
  value       = aws_secretsmanager_secret.db_password.arn
}

output "db_password_value" {
  description = "Generated DB password. Consumed only inside the RDS module."
  value       = random_password.db.result
  sensitive   = true
}

output "anthropic_api_key_secret_arn" {
  description = "ARN of the Anthropic API key secret."
  value       = aws_secretsmanager_secret.anthropic_api_key.arn
}
