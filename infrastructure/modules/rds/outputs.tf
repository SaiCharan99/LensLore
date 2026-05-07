output "endpoint" {
  description = "RDS endpoint (host:port)."
  value       = aws_db_instance.main.endpoint
}

output "address" {
  description = "RDS hostname (no port)."
  value       = aws_db_instance.main.address
}

output "port" {
  description = "RDS port."
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Initial database name."
  value       = aws_db_instance.main.db_name
}

output "username" {
  description = "Master username."
  value       = aws_db_instance.main.username
}

output "security_group_id" {
  description = "RDS security group ID."
  value       = aws_security_group.db.id
}
