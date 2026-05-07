terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "${var.name_prefix}-oac"
  description                       = "OAC for ${var.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ACM cert for the custom domain (CloudFront requires us-east-1).
# DNS validation: operator must add the validation CNAMEs to the apex domain
# before this resource finishes.
resource "aws_acm_certificate" "main" {
  count    = var.custom_domain_name == null ? 0 : 1
  provider = aws.us_east_1

  domain_name       = var.custom_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.name_prefix} CDN"
  default_root_object = ""
  price_class         = var.price_class
  http_version        = "http2and3"

  aliases = var.custom_domain_name == null ? [] : [var.custom_domain_name]

  origin {
    origin_id                = "s3-photos"
    domain_name              = var.bucket_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  default_cache_behavior {
    target_origin_id = "s3-photos"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    default_ttl = var.default_ttl_seconds
    min_ttl     = 0
    max_ttl     = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.custom_domain_name == null
    acm_certificate_arn            = var.custom_domain_name == null ? null : aws_acm_certificate.main[0].arn
    ssl_support_method             = var.custom_domain_name == null ? null : "sni-only"
    minimum_protocol_version       = var.custom_domain_name == null ? "TLSv1" : "TLSv1.2_2021"
  }
}

# Bucket policy attached AFTER the distribution exists, since the policy needs
# the distribution ARN in its condition.
data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid     = "AllowCloudFrontReadOnly"
    actions = ["s3:GetObject"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    resources = ["${var.bucket_arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "photos" {
  bucket = var.bucket_name
  policy = data.aws_iam_policy_document.bucket_policy.json
}
