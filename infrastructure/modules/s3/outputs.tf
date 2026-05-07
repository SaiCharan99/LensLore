output "bucket_name" {
  description = "S3 bucket name."
  value       = aws_s3_bucket.photos.id
}

output "bucket_arn" {
  description = "S3 bucket ARN."
  value       = aws_s3_bucket.photos.arn
}

output "bucket_regional_domain_name" {
  description = "Regional domain name. CloudFront uses this as its origin."
  value       = aws_s3_bucket.photos.bucket_regional_domain_name
}
