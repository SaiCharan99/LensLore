terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Bootstrap the state bucket via ./bootstrap.sh once per AWS account before
  # `terraform init`. The bucket name must be globally unique — change the
  # bucket value if `lenslore-tf-state` is taken.
  backend "s3" {
    bucket       = "lenslore-tf-state"
    key          = "lenslore/terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}
