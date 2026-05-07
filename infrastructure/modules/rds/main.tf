resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnets"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "db" {
  name        = "${var.name_prefix}-db"
  description = "PostgreSQL ingress only from the Symfony app SG."
  vpc_id      = var.vpc_id
}

resource "aws_security_group_rule" "db_ingress_from_app" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = var.app_security_group_id
  security_group_id        = aws_security_group.db.id
  description              = "PostgreSQL from Symfony app instances."
}

resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-db"

  engine         = "postgres"
  engine_version = "15"
  instance_class = var.instance_class

  db_name  = "lenslore"
  username = "lenslore"
  password = var.db_password_secret_value

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  multi_az = var.multi_az

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  backup_retention_period = var.backup_retention_days
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Skip final snapshot in dev to allow fast destroy; require it in prod.
  skip_final_snapshot       = !var.multi_az
  final_snapshot_identifier = var.multi_az ? "${var.name_prefix}-db-final-${formatdate("YYYYMMDDhhmmss", timestamp())}" : null

  deletion_protection = var.multi_az

  performance_insights_enabled    = true
  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    DbPasswordSecretArn = var.db_password_secret_arn
  }

  lifecycle {
    # final_snapshot_identifier uses timestamp(); ignore so plans stay clean.
    ignore_changes = [final_snapshot_identifier]
  }
}
