#!/bin/bash

echo "🚀 Deploying Investment Tracker Application..."

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework is not installed. Installing..."
    npm install -g serverless
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please configure AWS CLI first."
    echo "Run: aws configure"
    exit 1
fi

# Deploy backend first
echo "🔧 Deploying backend infrastructure..."
cd backend
serverless deploy --verbose

# Get the outputs from the deployment
API_URL=$(serverless info --verbose | grep "HttpApiUrl" | awk '{print $2}')
S3_BUCKET=$(serverless info --verbose | grep "FrontendBucketName" | awk '{print $2}')
CLOUDFRONT_ID=$(serverless info --verbose | grep "CloudFrontDistributionId" | awk '{print $2}')
CLOUDFRONT_URL=$(serverless info --verbose | grep "CloudFrontUrl" | awk '{print $2}')

echo "✅ Backend deployed successfully!"
echo "API Gateway URL: $API_URL"
echo "S3 Bucket: $S3_BUCKET"
echo "CloudFront Distribution ID: $CLOUDFRONT_ID"
echo "CloudFront URL: $CLOUDFRONT_URL"

cd ..

# Update frontend environment with API URL
echo "🔧 Updating frontend configuration..."
cd frontend

# Create or update .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_BASE_URL=$API_URL
S3_BUCKET_NAME=$S3_BUCKET
CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_ID
ASSET_PREFIX=https://$CLOUDFRONT_URL
EOF

# Build and deploy frontend
echo "🔧 Building and deploying frontend..."
npm run build

# Deploy to S3
echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET --delete --cache-control 'public, max-age=31536000' --exclude '*.html'
aws s3 sync dist/ s3://$S3_BUCKET --delete --cache-control 'public, max-age=0' --include '*.html'

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

cd ..

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application is now live at: https://$CLOUDFRONT_URL"
echo "🔗 API Gateway URL: $API_URL"
echo ""
echo "Next steps:"
echo "1. Test your application at the CloudFront URL"
echo "2. Update your DNS records if using a custom domain"
echo "3. Configure monitoring and alerts as needed"