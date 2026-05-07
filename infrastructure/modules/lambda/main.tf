data "archive_file" "package" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/.builds/${var.function_name}.zip"
  excludes    = ["*.map"]
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "exec" {
  name               = "${var.function_name}-exec"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "exec" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    sid       = "ReadAnthropicSecret"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.anthropic_secret]
  }
}

resource "aws_iam_role_policy" "exec" {
  name   = "${var.function_name}-exec"
  role   = aws_iam_role.exec.id
  policy = data.aws_iam_policy_document.exec.json
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "main" {
  function_name = var.function_name
  role          = aws_iam_role.exec.arn

  filename         = data.archive_file.package.output_path
  source_code_hash = data.archive_file.package.output_base64sha256

  runtime     = "nodejs20.x"
  handler     = "index.handler"
  memory_size = var.memory_mb
  timeout     = var.timeout_seconds

  environment {
    variables = {
      ANTHROPIC_API_KEY_SECRET_ARN = var.anthropic_secret
    }
  }

  # The log group is created above with explicit retention; without this
  # depends_on, Lambda may auto-create the log group with no retention first.
  depends_on = [aws_cloudwatch_log_group.lambda]
}
