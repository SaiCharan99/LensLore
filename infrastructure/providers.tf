provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# CloudFront ACM certificates must live in us-east-1 even when the rest of
# the stack runs in another region. Used by the cloudfront module when a
# custom domain is configured; harmless when unused.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.common_tags
  }
}
