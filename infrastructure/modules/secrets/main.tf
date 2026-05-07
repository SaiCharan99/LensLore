resource "random_password" "db" {
  length = 32
  # RDS rejects /, @, ", and space in master passwords.
  override_special = "!#$%&*+-_=?"
}

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.name_prefix}-db-password"
  description             = "RDS master password for ${var.name_prefix}."
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db.result
}

resource "aws_secretsmanager_secret" "anthropic_api_key" {
  name                    = "${var.name_prefix}-anthropic-api-key"
  description             = "Anthropic API key consumed by the LensLore Lambdas."
  recovery_window_in_days = 7
}

# Only seed the secret if a value was provided. If empty, the resource still
# exists in Secrets Manager and can be populated via aws CLI or the console.
resource "aws_secretsmanager_secret_version" "anthropic_api_key" {
  count         = var.anthropic_api_key == "" ? 0 : 1
  secret_id     = aws_secretsmanager_secret.anthropic_api_key.id
  secret_string = var.anthropic_api_key
}
