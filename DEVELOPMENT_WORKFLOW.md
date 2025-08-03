# 🔄 Development Workflow Guide

## Overview

This guide explains how to work with both **Development** and **Production** environments for PortfolioSync, including day-to-day development, testing, and release processes.

## 🌍 Environment Structure

### **Development Environment**
- **Purpose**: Daily development, feature testing, experimentation
- **API**: https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com
- **Frontend**: https://d1s0t04ct1krwo.cloudfront.net
- **Database**: `portfoliosync-backend-dev-*` tables
- **Security**: Relaxed (no auth required, loose validation)
- **Data**: Contains dummy data for quick testing

### **Production Environment**
- **Purpose**: Live application for real users
- **API**: https://api-prod.investmenttracker.com.au
- **Frontend**: https://investmenttracker.com.au
- **Database**: `portfoliosync-backend-prod-*` tables
- **Security**: Strict (authentication required, full validation)
- **Data**: Clean, real user data only

## 📁 Project Structure for Multi-Environment

```
investment-tracker/
├── frontend/
│   ├── .env.development          # Dev environment config
│   ├── .env.production          # Prod environment config
│   └── src/
│       ├── config/env.ts        # Environment detection
│       └── services/api.ts      # API client with env switching
├── backend/
│   ├── serverless.yml           # Development deployment
│   ├── serverless.prod.yml      # Production deployment
│   ├── .env.dev                 # Dev environment variables
│   └── .env.prod                # Prod environment variables
└── scripts/
    ├── production-release.sh    # Automated prod deployment
    └── dev-deploy.sh           # Quick dev deployment
```

## 🛠️ Daily Development Workflow

### **1. Setting Up Development Environment**

```bash
# Clone and setup
git clone <repository>
cd investment-tracker

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set environment variables for development
cd backend
cp .env.dev .env

# Deploy to development
npx serverless deploy --stage dev
```

### **2. Frontend Development**

```bash
cd frontend

# Start development server (uses dev environment)
npm run dev

# The frontend automatically uses:
# - Development API endpoint
# - Dummy data enabled
# - Debug mode enabled
# - No authentication required
```

### **3. Backend Development**

```bash
cd backend

# Deploy changes to development
npx serverless deploy --stage dev

# Deploy single function for faster iteration
npx serverless deploy function --function createStock --stage dev

# View logs
npx serverless logs --function createStock --stage dev --tail
```

### **4. Testing with Development Environment**

```bash
# Frontend tests
cd frontend
npm run test

# Manual API testing (no auth needed in dev)
curl -X GET "https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios"

# Create test data
curl -X POST "https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Portfolio", "description": "Development testing"}'
```

## 🎯 Environment-Specific Development

### **Working with Development Mode**

Development environment is designed for fast iteration:

```javascript
// Frontend automatically detects development
if (import.meta.env.VITE_APP_ENV === 'development') {
  // Use dummy data
  // Disable authentication
  // Enable debug logging
  // Show detailed errors
}
```

```python
# Backend automatically uses development settings
if os.environ.get('STAGE') == 'dev':
    # Disable authentication
    # Use loose validation
    # Enable verbose logging
    # Allow CORS from localhost
```

### **Key Development Features**

1. **No Authentication Required**
   ```bash
   # Works in development (no headers needed)
   curl https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios
   ```

2. **Dummy Data Available**
   ```javascript
   // Frontend shows sample portfolios automatically
   const portfolios = useDummyData ? DUMMY_PORTFOLIOS : await fetchRealData()
   ```

3. **Development Bypass Headers**
   ```bash
   # Force development mode even in production
   curl -H "X-Dev-Mode: true" https://api-prod.example.com/portfolios
   ```

4. **Loose Validation**
   ```python
   # Development allows invalid data with warnings
   if validation_level == 'loose':
       logger.warning(f"Invalid data: {errors}")
       continue  # Don't block request
   ```

## 🏭 Production Deployment

### **Before Deploying to Production**

1. **Test Thoroughly in Development**
   ```bash
   cd frontend
   npm run test
   npm run build  # Ensure production build works
   
   cd ../backend
   # Deploy to dev and test all endpoints
   npx serverless deploy --stage dev
   ```

2. **Update Version Number**
   ```bash
   # Update version in package.json files
   # Update VERSION.md
   # Update CHANGELOG.md
   ```

3. **Security Check**
   ```bash
   # Run security audits
   cd frontend && npm audit
   cd ../backend && npm audit
   
   # Ensure no sensitive data in code
   grep -r "password\|secret\|key" . --exclude-dir=node_modules
   ```

### **Production Deployment Methods**

#### **Method 1: Automated Script (Recommended)**
```bash
# Run the production release script
./scripts/production-release.sh

# Follow prompts for:
# - API keys configuration
# - Security settings verification
# - Database setup confirmation
```

#### **Method 2: Manual Deployment**
```bash
# 1. Deploy backend
cd backend
npx serverless deploy --config serverless.prod.yml --stage prod

# 2. Build and deploy frontend
cd ../frontend
npm run build
aws s3 sync dist/ s3://investment-tracker-frontend-prod --delete

# 3. Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id XXXXXXXX --paths "/*"
```

#### **Method 3: CI/CD (Git Tags)**
```bash
# Create version tag to trigger automatic deployment
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions automatically:
# - Runs tests
# - Deploys backend
# - Builds frontend
# - Deploys to S3/CloudFront
# - Creates GitHub release
```

## 🔄 Feature Development Workflow

### **1. Starting a New Feature**

```bash
# Create feature branch from develop
git checkout develop
git checkout -b feature/cryptocurrency-tracking

# Set up development environment
cd backend
cp .env.dev .env
npx serverless deploy --stage dev
```

### **2. Development Phase**

```bash
# Make changes and test in development
# Frontend: http://localhost:3000 (uses dev API)
# Backend: Deployed to dev stage

# Test with dummy data
cd frontend
npm run dev

# The app automatically:
# - Uses development API
# - Loads dummy portfolios
# - Skips authentication
# - Shows debug information
```

### **3. Testing New Features**

```bash
# Frontend testing
cd frontend
npm run test
npm run test:e2e  # If you have E2E tests

# Backend testing
cd backend
# Test API endpoints manually
curl -X POST "https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios/test123/crypto" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC", "quantity": 0.5, "purchasePrice": 50000}'

# View logs
npx serverless logs --function createCrypto --stage dev --tail
```

### **4. Preparing for Production**

```bash
# Switch to production environment variables for testing
cd frontend
cp .env.production .env.local
npm run build  # Test production build

# Verify no development-only code
grep -r "console.log\|debugger" src/
grep -r "DUMMY_DATA\|mock" src/
```

### **5. Merging and Release**

```bash
# Merge feature to develop
git checkout develop
git merge feature/cryptocurrency-tracking
git push origin develop

# When ready for production release
git checkout main
git merge develop
git tag v1.1.0  # New minor version
git push origin v1.1.0  # Triggers production deployment
```

## 🧪 Testing Strategies

### **Development Testing**

```bash
# Quick API tests (no auth needed)
curl https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios

# Frontend with dummy data
cd frontend
npm run dev
# Navigate to http://localhost:3000
# See sample portfolios immediately
```

### **Production Testing**

```bash
# Test production API (requires auth in real prod)
curl -H "Authorization: Bearer <token>" \
  https://api-prod.investmenttracker.com.au/portfolios

# Test production frontend
open https://investmenttracker.com.au
# Should show login screen
# Clean database with no dummy data
```

### **Cross-Environment Testing**

```bash
# Test development mode in production (for debugging)
curl -H "X-Dev-Mode: true" \
  https://api-prod.investmenttracker.com.au/portfolios

# This bypasses authentication for development team testing
```

## 🛠️ Common Development Tasks

### **Adding a New API Endpoint**

1. **Develop in Development Environment**
   ```python
   # backend/functions/crypto/create_crypto.py
   @require_auth  # Will be bypassed in development
   @validate_input(CRYPTO_VALIDATION_RULES)  # Loose validation in dev
   def handler(event, context):
       # Implementation
   ```

2. **Add to Development Serverless Config**
   ```yaml
   # backend/serverless.yml (development)
   functions:
     createCrypto:
       handler: functions/crypto/create_crypto.handler
       events:
         - httpApi:
             path: /portfolios/{portfolioId}/crypto
             method: post
   ```

3. **Deploy and Test in Development**
   ```bash
   npx serverless deploy --stage dev
   curl -X POST "https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios/test123/crypto" \
     -H "Content-Type: application/json" \
     -d '{"symbol": "BTC", "quantity": 0.5}'
   ```

4. **Add to Production Config**
   ```yaml
   # backend/serverless.prod.yml
   functions:
     createCrypto:
       handler: functions/crypto/create_crypto.handler
       events:
         - httpApi:
             path: /portfolios/{portfolioId}/crypto
             method: post
   ```

### **Adding Frontend Features**

1. **Develop with Mock Data**
   ```javascript
   // frontend/src/services/cryptoService.ts
   export const getCryptoHoldings = async (portfolioId: string) => {
     if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
       return DUMMY_CRYPTO_DATA;  // Quick development
     }
     return await api.get(`/portfolios/${portfolioId}/crypto`);
   };
   ```

2. **Environment-Aware Configuration**
   ```javascript
   // frontend/src/config/env.ts
   export const config = {
     apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
     useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
     authEnabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
     debugMode: import.meta.env.VITE_DEBUG_MODE === 'true'
   };
   ```

## 🚨 Troubleshooting

### **Development Issues**

```bash
# Backend deployment fails
cd backend
npx serverless logs --function createStock --stage dev

# Frontend can't connect to API
# Check .env.development file
cat frontend/.env.development

# CORS issues
# Ensure development URL is in serverless.yml CORS settings
```

### **Production Issues**

```bash
# Authentication failures
# Check Cognito configuration in AWS SSM
aws ssm get-parameter --name "/portfoliosync/prod/cognito-user-pool-id"

# Database connection issues
# Check DynamoDB table names and IAM permissions
aws dynamodb list-tables --query 'TableNames[?contains(@, `portfoliosync-backend-prod`)]'

# API Gateway errors
# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/portfoliosync-backend-prod"
```

### **Environment Switching Issues**

```bash
# Wrong environment variables
cd backend
cat .env  # Should match your target environment

cd frontend
cat .env.local  # Should override for local development

# Clear browser cache when switching between environments
# Development and production may cache different API responses
```

## 📊 Monitoring and Logging

### **Development Monitoring**

```bash
# Real-time backend logs
npx serverless logs --function createStock --stage dev --tail

# Frontend debug console
# Open browser DevTools
# Check console for debug information
console.log(`Environment: ${import.meta.env.VITE_APP_ENV}`);
```

### **Production Monitoring**

```bash
# CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/portfoliosync-backend-prod"

# API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=portfoliosync-backend-prod \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## 🔐 Security Considerations

### **Development Security**
- ✅ Safe to use dummy data
- ✅ No real user information
- ✅ CORS allows localhost
- ⚠️ Authentication disabled for easy testing

### **Production Security**
- ✅ Full authentication required
- ✅ Strict input validation
- ✅ Encrypted database storage
- ✅ Rate limiting enabled
- ✅ No debug information exposed

### **Switching Between Environments**
```bash
# Never commit real API keys to development
# Use AWS SSM Parameter Store for production secrets
# Keep .env files in .gitignore
# Use different AWS accounts for dev/prod if possible
```

## 🎯 Best Practices

1. **Always develop in development environment first**
2. **Test thoroughly before production deployment**
3. **Use version tags for production releases**
4. **Keep dummy data clearly marked and separate**
5. **Monitor both environments regularly**
6. **Document any environment-specific configurations**
7. **Use feature flags for gradual rollouts**

This workflow ensures you can develop quickly while maintaining production security and reliability!