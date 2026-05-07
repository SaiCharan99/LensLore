output "distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN."
  value       = aws_cloudfront_distribution.main.arn
}

output "distribution_domain" {
  description = "Default CloudFront domain (e.g. d1234.cloudfront.net)."
  value       = aws_cloudfront_distribution.main.domain_name
}

output "acm_certificate_validation_records" {
  description = "DNS records to add for ACM cert validation. Empty when no custom domain configured."
  value = var.custom_domain_name == null ? [] : [
    for opt in aws_acm_certificate.main[0].domain_validation_options : {
      name  = opt.resource_record_name
      type  = opt.resource_record_type
      value = opt.resource_record_value
    }
  ]
}
