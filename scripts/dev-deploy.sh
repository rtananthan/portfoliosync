#!/bin/bash

# Quick Development Deployment Script
# For fast iteration during feature development

set -e

echo "🔧 Quick Development Deployment"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "backend/serverless.yml" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check AWS credentials
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Error: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

echo "✅ AWS credentials verified"

# Deploy backend to development
echo "🚀 Deploying backend to development..."
cd backend

# Ensure we're using development environment
if [ ! -f ".env" ]; then
    echo "📝 Creating development environment file..."
    cp .env.dev .env
fi

# Quick deployment to dev stage
npx serverless deploy --stage dev

# Get development API URL
DEV_API_URL=$(aws cloudformation describe-stacks \
    --stack-name portfoliosync-backend-dev \
    --region ap-southeast-2 \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
    --output text 2>/dev/null || echo "https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com")

echo "✅ Backend deployed to development!"
echo "🌐 Development API URL: $DEV_API_URL"

# Build frontend for development
echo "🎨 Building frontend for development..."
cd ../frontend

# Ensure development environment file exists
if [ ! -f ".env.development" ]; then
    echo "📝 Creating development environment file..."
    cat > .env.development << EOF
VITE_APP_ENV=development
VITE_API_BASE_URL=$DEV_API_URL
VITE_APP_VERSION=dev-$(date +%Y%m%d-%H%M%S)
VITE_USE_MOCK_DATA=true
VITE_AUTH_ENABLED=false
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_BENCHMARKING=true
VITE_ENABLE_EXPORT=true
EOF
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Build frontend
npm run build

echo "✅ Frontend built for development"

# Deploy to development S3 bucket
echo "☁️  Deploying frontend to development CloudFront..."

# Check if development S3 bucket exists
if aws s3 ls s3://investment-tracker-frontend-dev > /dev/null 2>&1; then
    # Sync to existing dev bucket
    aws s3 sync dist/ s3://investment-tracker-frontend-dev --delete
    
    # Create CloudFront invalidation for dev distribution
    DEV_DISTRIBUTION_ID=$(aws cloudfront list-distributions \
        --query 'DistributionList.Items[?Comment==`Investment Tracker Development`].Id' \
        --output text 2>/dev/null)
    
    if [ ! -z "$DEV_DISTRIBUTION_ID" ] && [ "$DEV_DISTRIBUTION_ID" != "None" ]; then
        aws cloudfront create-invalidation \
            --distribution-id $DEV_DISTRIBUTION_ID \
            --paths "/*" > /dev/null
        echo "✅ Development CloudFront invalidation created"
    else
        echo "⚠️  Development CloudFront distribution not found - using existing one"
    fi
else
    # Use the existing shared development deployment
    echo "ℹ️  Using shared development environment at: https://d1s0t04ct1krwo.cloudfront.net"
fi

cd ..

# Quick smoke tests
echo "🧪 Running quick smoke tests..."

echo "Testing backend API..."
if curl -s "$DEV_API_URL/portfolios" > /dev/null; then
    echo "✅ Backend API responding"
else
    echo "⚠️  Backend API test failed - check deployment"
fi

echo "Testing frontend build..."
if [ -f "frontend/dist/index.html" ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
fi

echo ""
echo "🎉 Development Deployment Complete!"
echo "=================================="
echo ""
echo "🔧 Development URLs:"
echo "   Backend API: $DEV_API_URL"
echo "   Frontend: https://d1s0t04ct1krwo.cloudfront.net"
echo "   Local Dev: http://localhost:3000 (run 'npm run dev' in frontend/)"
echo ""
echo "🛠️  Development Features:"
echo "   ✅ Authentication: DISABLED (no login needed)"
echo "   ✅ Dummy data: ENABLED (sample portfolios visible)"
echo "   ✅ Debug mode: ENABLED (verbose logging)"
echo "   ✅ Mock API: Available for offline development"
echo ""
echo "📋 Quick Commands:"
echo "   Start local dev: cd frontend && npm run dev"
echo "   View logs: cd backend && npx serverless logs --function getPortfolios --stage dev --tail"
echo "   Test API: curl $DEV_API_URL/portfolios"
echo "   Redeploy function: cd backend && npx serverless deploy function --function FUNCTION_NAME --stage dev"
echo ""
echo "🔄 Next Steps:"
echo "   1. Test your changes in development"
echo "   2. Run 'npm test' in frontend for unit tests"
echo "   3. When ready, merge to main and tag for production release"

# Show current git status
echo ""
echo "📊 Current Git Status:"
git status --porcelain | head -10