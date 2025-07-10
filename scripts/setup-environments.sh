#!/bin/bash

# Setup Development Environments Script
echo "🚀 Setting up development environments..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "backend/serverless.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Setting up git branches..."

# Create develop branch if it doesn't exist
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop 2>/dev/null || print_warning "Develop branch may already exist on remote"

print_success "Git branches configured"

print_status "Creating staging environment..."

# Create staging S3 bucket
STAGING_BUCKET="investment-tracker-frontend-staging"
aws s3 mb s3://$STAGING_BUCKET --region ap-southeast-2 || print_warning "Staging bucket may already exist"

# Configure S3 bucket for static website hosting
aws s3 website s3://$STAGING_BUCKET --index-document index.html --error-document index.html

# Create staging bucket policy
cat > /tmp/staging-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$STAGING_BUCKET/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $STAGING_BUCKET --policy file:///tmp/staging-bucket-policy.json
rm /tmp/staging-bucket-policy.json

print_success "Staging S3 bucket created: $STAGING_BUCKET"

print_status "Creating staging CloudFront distribution..."

# Create CloudFront distribution for staging
STAGING_CLOUDFRONT_CONFIG=$(cat << EOF
{
    "CallerReference": "staging-investment-tracker-$(date +%s)",
    "Aliases": {
        "Quantity": 0
    },
    "DefaultRootObject": "index.html",
    "Comment": "Investment Tracker Staging Environment",
    "Enabled": true,
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$STAGING_BUCKET",
                "DomainName": "$STAGING_BUCKET.s3-website-ap-southeast-2.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$STAGING_BUCKET",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
EOF
)

# Create the distribution
STAGING_DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config "$STAGING_CLOUDFRONT_CONFIG" --query 'Distribution.Id' --output text)

if [ $? -eq 0 ]; then
    print_success "Staging CloudFront distribution created: $STAGING_DISTRIBUTION_ID"
else
    print_error "Failed to create staging CloudFront distribution"
fi

print_status "Deploying staging backend..."

# Deploy staging backend
cd backend
serverless deploy --stage staging || print_error "Failed to deploy staging backend"
cd ..

print_success "Staging environment setup complete!"

print_status "Getting staging API URL..."
STAGING_API_URL=$(cd backend && serverless info --stage staging | grep "ServiceEndpoint" | awk '{print $2}')

echo
echo "🎉 Environment setup complete!"
echo
echo "📝 Add these secrets to your GitHub repository:"
echo "   - Repository Settings → Secrets and variables → Actions"
echo
echo "Required GitHub Secrets:"
echo "  STAGING_S3_BUCKET: $STAGING_BUCKET"
echo "  STAGING_CLOUDFRONT_ID: $STAGING_DISTRIBUTION_ID"
echo "  STAGING_API_URL: $STAGING_API_URL"
echo "  PRODUCTION_S3_BUCKET: investment-tracker-frontend-dev"
echo "  PRODUCTION_CLOUDFRONT_ID: E2A7VVR87NWEW1"
echo "  PRODUCTION_API_URL: https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com"
echo
echo "🌍 Staging URL will be available at:"
echo "  https://$(aws cloudfront get-distribution --id $STAGING_DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)"
echo
echo "⚡ Next steps:"
echo "  1. Add the GitHub secrets above"
echo "  2. Push to 'develop' branch to deploy staging"
echo "  3. Push to 'main' branch to deploy production"
echo
echo "🔧 Development workflow:"
echo "  git checkout develop"
echo "  git checkout -b feature/my-feature"
echo "  # Make changes..."
echo "  git push origin feature/my-feature"
echo "  git checkout develop && git merge feature/my-feature && git push"