#!/usr/bin/env bash
# One-time bootstrap. Creates the S3 bucket Terraform uses for remote state.
# Run this once per AWS account before `terraform init`.
#
# Usage:
#   AWS_PROFILE=lenslore ./bootstrap.sh

set -euo pipefail

BUCKET="${TF_STATE_BUCKET:-lenslore-tf-state}"
REGION="${AWS_REGION:-eu-west-1}"

echo "Creating Terraform state bucket: s3://${BUCKET} in ${REGION}"

if aws s3api head-bucket --bucket "${BUCKET}" 2>/dev/null; then
    echo "Bucket ${BUCKET} already exists. Nothing to do."
    exit 0
fi

aws s3api create-bucket \
    --bucket "${BUCKET}" \
    --region "${REGION}" \
    --create-bucket-configuration "LocationConstraint=${REGION}"

aws s3api put-bucket-versioning \
    --bucket "${BUCKET}" \
    --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
    --bucket "${BUCKET}" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}
        }]
    }'

aws s3api put-public-access-block \
    --bucket "${BUCKET}" \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "Done. Now run:"
echo "  terraform init"
echo "  terraform workspace new dev"
echo "  terraform plan -var-file=env/dev.tfvars"
