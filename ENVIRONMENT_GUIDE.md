# 🌍 Environment Configuration Guide

## Quick Reference

| Environment | Purpose | API URL | Frontend URL | Auth Required | Data Type |
|-------------|---------|---------|--------------|---------------|-----------|
| **Development** | Daily coding, testing | https://7mjwgcrtq0.execute-api... | https://d1s0t04ct1krwo.cloudfront.net | ❌ No | 🎭 Dummy |
| **Production** | Live users | https://api-prod.investmenttracker.com.au | https://investmenttracker.com.au | ✅ Yes | 🏢 Real |

## 🏁 Quick Start

### **For Development Work:**
```bash
# Deploy to development (fast iteration)
./scripts/dev-deploy.sh

# Start local development
cd frontend && npm run dev
# Visit: http://localhost:3000
# Uses development API, no login needed, dummy data available
```

### **For Production Release:**
```bash
# Deploy v1.0.0 to production
./scripts/production-release.sh

# Or use automated CI/CD
git tag v1.0.0
git push origin v1.0.0
```

## 🔄 Daily Development Workflow

### **Morning Setup:**
```bash
# 1. Pull latest changes
git pull origin develop

# 2. Quick deploy to development
./scripts/dev-deploy.sh

# 3. Start frontend development
cd frontend
npm run dev
```

### **Feature Development:**
```bash
# 1. Create feature branch
git checkout -b feature/new-analytics

# 2. Develop using development environment
# - Frontend: http://localhost:3000 (connects to dev API)
# - Backend: Auto-deployed to dev stage
# - Data: Uses dummy portfolios for quick testing
# - Auth: Disabled for fast iteration

# 3. Test changes
curl https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios
# No authentication needed in development

# 4. Deploy individual functions for fast feedback
cd backend
npx serverless deploy function --function newAnalytics --stage dev
```

### **Testing & Deployment:**
```bash
# 1. Test in development environment
npm run test

# 2. When ready, merge to develop
git checkout develop
git merge feature/new-analytics

# 3. For production release
git checkout main
git merge develop
git tag v1.1.0
git push origin v1.1.0  # Triggers automatic production deployment
```

## 🛠️ Environment-Specific Features

### **Development Environment Benefits:**

#### **No Authentication Hassle**
```bash
# Just works - no tokens needed
curl https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios

# Create test data instantly
curl -X POST https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Portfolio", "description": "Quick test"}'
```

#### **Instant Dummy Data**
```javascript
// Frontend automatically shows sample portfolios
// No need to create test data manually
// Perfect for UI development and demos
```

#### **Debug-Friendly**
```javascript
// Development shows detailed errors
// Console.log statements visible
// Validation warnings instead of blocks
// CORS allows localhost connections
```

#### **Fast Iteration**
```bash
# Deploy single function
npx serverless deploy function --function createStock --stage dev

# View real-time logs
npx serverless logs --function createStock --stage dev --tail

# No cache issues - changes visible immediately
```

### **Production Environment Security:**

#### **Full Authentication**
```bash
# Requires valid JWT token
curl -H "Authorization: Bearer <jwt-token>" \
  https://api-prod.investmenttracker.com.au/portfolios
```

#### **Clean Data**
```javascript
// No dummy data in production
// All portfolios are real user data
// No sample/test accounts
```

#### **Strict Validation**
```python
# Production blocks invalid requests
# Security-first approach
# Rate limiting enforced
# All inputs validated strictly
```

## 📱 Frontend Environment Detection

The frontend automatically adapts based on environment:

```javascript
// src/config/env.ts
export const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'
export const isProduction = import.meta.env.VITE_APP_ENV === 'production'

// Automatic behavior:
if (isDevelopment) {
  // Show dummy data toggle
  // Display debug information
  // Skip authentication
  // Enable development tools
}

if (isProduction) {
  // Hide debug features
  // Require authentication
  // Use only real data
  // Optimized performance
}
```

## 🔧 Backend Environment Detection

The backend automatically configures based on deployment stage:

```python
# shared/auth_middleware.py
stage = os.environ.get('STAGE', 'dev')
auth_enabled = stage == 'prod'  # Only require auth in production

if stage == 'dev':
    # Bypass authentication
    # Loose validation
    # Verbose logging
    # Allow all CORS origins
    
if stage == 'prod':
    # Strict authentication
    # Full validation
    # Minimal logging
    # Restricted CORS
```

## 🎯 Common Development Scenarios

### **Scenario 1: Adding a New Feature**

```bash
# 1. Start in development
git checkout -b feature/cryptocurrency

# 2. Use development environment for fast feedback
cd frontend && npm run dev
# Visit http://localhost:3000
# See dummy data immediately, no login needed

# 3. Add backend functionality
cd backend
# Edit functions, deploy to dev
npx serverless deploy --stage dev

# 4. Test without authentication hassles
curl https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios/test123/crypto \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC", "quantity": 0.5}'

# 5. When feature is complete, release to production
git tag v1.2.0 && git push origin v1.2.0
```

### **Scenario 2: Debugging Production Issues**

```bash
# 1. Reproduce in development first
./scripts/dev-deploy.sh

# 2. Use development bypass in production for debugging
curl -H "X-Dev-Mode: true" \
  https://api-prod.investmenttracker.com.au/portfolios
# This bypasses authentication for troubleshooting

# 3. Check production logs
aws logs describe-log-streams --log-group-name "/aws/lambda/portfoliosync-backend-prod-getPortfolios"

# 4. Deploy fix to development first, then production
```

### **Scenario 3: UI/UX Development**

```bash
# 1. Use development with dummy data for rapid UI iteration
cd frontend
npm run dev

# Frontend automatically:
# - Loads sample portfolios
# - Shows various data states
# - No authentication flow needed
# - Perfect for design work

# 2. Switch to production URL to test with real data
# Change .env.local temporarily to production API
# Test authentication flow
# Verify with real user data structure
```

## 🚨 Environment Switching Best Practices

### **When to Use Development:**
- ✅ Daily feature development
- ✅ UI/UX experimentation  
- ✅ API testing and debugging
- ✅ Performance testing with dummy data
- ✅ Demo preparation

### **When to Use Production:**
- ✅ Final user acceptance testing
- ✅ Performance testing with real data
- ✅ Authentication flow testing
- ✅ Production issue debugging
- ✅ Customer demonstrations

### **Never Do This:**
- ❌ Develop directly in production
- ❌ Test with real user data in development
- ❌ Skip development testing before production
- ❌ Commit development API keys to git
- ❌ Use production credentials in development

## 📊 Monitoring Both Environments

### **Development Monitoring:**
```bash
# Real-time function logs
npx serverless logs --function getPortfolios --stage dev --tail

# API Gateway metrics
aws cloudwatch get-metric-statistics --namespace AWS/ApiGateway \
  --metric-name Count --dimensions Name=ApiName,Value=portfoliosync-backend-dev

# DynamoDB operations
aws dynamodb describe-table --table-name portfoliosync-backend-dev-portfolios
```

### **Production Monitoring:**
```bash
# Production logs (more restricted)
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/portfoliosync-backend-prod"

# Cost monitoring
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# Performance monitoring
aws cloudwatch get-metric-statistics --namespace AWS/Lambda \
  --metric-name Duration --dimensions Name=FunctionName,Value=portfoliosync-backend-prod-getPortfolios
```

## 🔐 Security Differences

| Security Feature | Development | Production |
|------------------|-------------|------------|
| **Authentication** | ❌ Disabled | ✅ Required (Cognito JWT) |
| **Input Validation** | ⚠️ Loose (warnings) | ✅ Strict (blocking) |
| **Rate Limiting** | 🔓 1000/min | 🔒 100/min |
| **CORS** | 🌍 Allow all | 🎯 Specific domains |
| **Error Details** | 📝 Verbose | 🤐 Minimal |
| **Database Encryption** | ❌ Optional | ✅ Required |
| **API Keys** | 🔓 Placeholders | 🔐 Real (in SSM) |
| **Logging** | 📊 Debug level | 📈 Info level |

## 💡 Pro Tips

### **Fast Development:**
```bash
# Use function-level deployment for faster feedback
npx serverless deploy function --function createStock --stage dev

# Use local frontend with remote development API
cd frontend && npm run dev
# Connects to deployed development backend automatically
```

### **Efficient Testing:**
```bash
# Test API changes without frontend
curl -X POST https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com/portfolios \
  -H "Content-Type: application/json" \
  -d '{"name": "API Test Portfolio"}'

# Use development bypass header for production debugging
curl -H "X-Dev-Mode: true" https://api-prod.example.com/portfolios
```

### **Environment Verification:**
```bash
# Check which environment you're targeting
aws sts get-caller-identity  # Verify AWS account
cat backend/.env  # Check environment variables
cat frontend/.env.local  # Check frontend configuration
```

This dual-environment setup gives you the best of both worlds: fast development iteration and secure production deployment! 🚀