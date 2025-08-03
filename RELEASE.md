# 🚀 Release Management Guide

## Production Release Process (v1.0.0)

### **📋 Pre-Release Checklist**

Before releasing to production, ensure:

- [ ] All tests pass (`npm test` in frontend)
- [ ] Security audit clean (`npm audit` in both frontend/backend)
- [ ] No dummy data in production environment
- [ ] API keys configured in AWS SSM Parameter Store
- [ ] CloudFront distribution configured
- [ ] Domain name configured (if using custom domain)
- [ ] Monitoring and alerting set up

### **🎯 Release Types**

#### **MAJOR Release (2.0.0)**
Breaking changes that require user migration:
```bash
# Example: Adding user authentication, changing API structure
git tag v2.0.0
git push origin v2.0.0
```

#### **MINOR Release (1.1.0)**  
New features, backwards compatible:
```bash
# Example: Adding cryptocurrency support, new analytics
git tag v1.1.0
git push origin v1.1.0
```

#### **PATCH Release (1.0.1)**
Bug fixes and security patches:
```bash
# Example: UI fixes, performance improvements
git tag v1.0.1
git push origin v1.0.1
```

### **🏭 Production Deployment Steps**

#### **Method 1: Automated (Recommended)**
```bash
# 1. Ensure you're on main branch with latest changes
git checkout main
git pull origin main

# 2. Create and push version tag
git tag v1.0.0
git push origin v1.0.0

# 3. GitHub Actions automatically deploys to production
# Monitor at: https://github.com/your-username/investment-tracker/actions
```

#### **Method 2: Manual Deployment**
```bash
# 1. Run the production release script
./scripts/production-release.sh

# 2. Follow the prompts to configure API keys
# 3. Script will deploy backend and frontend automatically
```

### **🔄 Development Workflow**

#### **Feature Development**
```bash
# 1. Create feature branch from develop
git checkout develop
git checkout -b feature/tax-reporting

# 2. Develop and test feature
# ... make changes ...
git add .
git commit -m "Add Australian tax reporting feature"

# 3. Merge back to develop
git checkout develop
git merge feature/tax-reporting
git push origin develop

# 4. Deploy to development environment
npx serverless deploy --stage dev
```

#### **Hotfix for Production**
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/security-patch

# 2. Apply critical fix
# ... make changes ...
git add .
git commit -m "Fix: Security vulnerability in auth middleware"

# 3. Merge to main and develop
git checkout main
git merge hotfix/security-patch

git checkout develop
git merge hotfix/security-patch

# 4. Create patch release
git tag v1.0.1
git push origin v1.0.1
```

### **🌍 Environment URLs**

| Environment | Backend API | Frontend | Database |
|-------------|-------------|----------|----------|
| **Development** | https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com | https://d1s0t04ct1krwo.cloudfront.net | portfoliosync-backend-dev-* |
| **Production** | https://api-prod.investmenttracker.com.au | https://investmenttracker.com.au | portfoliosync-backend-prod-* |

### **🛡️ Security Differences by Environment**

| Feature | Development | Production |
|---------|-------------|------------|
| Authentication | ❌ Disabled | ✅ Required |
| Input Validation | ⚠️ Loose | ✅ Strict |
| Rate Limiting | 1000/min | 100/min |
| Database Encryption | ❌ No | ✅ Yes |
| Dummy Data | ✅ Present | ❌ Removed |
| Error Details | ✅ Verbose | ❌ Minimal |

### **📊 Monitoring Production**

#### **Health Checks**
```bash
# Backend API health
curl https://api-prod.investmenttracker.com.au/portfolios

# Frontend availability  
curl -I https://investmenttracker.com.au

# Database connectivity (via API)
curl https://api-prod.investmenttracker.com.au/health
```

#### **Performance Monitoring**
- CloudWatch metrics for Lambda functions
- DynamoDB read/write capacity monitoring
- CloudFront cache hit ratios
- API Gateway 4xx/5xx error rates

### **🔧 Rollback Procedure**

If production issues occur:

1. **Immediate Rollback (Frontend)**
   ```bash
   # Revert to previous S3 deployment
   aws s3 sync s3://investment-tracker-frontend-backup/ s3://investment-tracker-frontend-prod/
   aws cloudfront create-invalidation --distribution-id XXXXXXXX --paths "/*"
   ```

2. **Backend Rollback**
   ```bash
   # Redeploy previous version
   git checkout v1.0.0  # Previous working version
   cd backend
   npx serverless deploy --config serverless.prod.yml --stage prod
   ```

3. **Database Rollback**
   ```bash
   # Use DynamoDB Point-in-Time Recovery if needed
   aws dynamodb restore-table-to-point-in-time \
     --source-table-name portfoliosync-backend-prod-portfolios \
     --target-table-name portfoliosync-backend-prod-portfolios-restored \
     --restore-date-time 2024-01-01T00:00:00.000Z
   ```

### **🎯 Release v1.0.0 Specific Tasks**

#### **Before First Production Release:**

1. **Configure Production Domain**
   ```bash
   # Set up Route 53 and CloudFront for custom domain
   # Update serverless.prod.yml with real domain
   ```

2. **Set Up Real API Keys**
   ```bash
   # Replace placeholder keys in AWS SSM
   aws ssm put-parameter --name "/portfoliosync/prod/alpha-vantage-key" --value "YOUR_REAL_KEY" --overwrite
   aws ssm put-parameter --name "/portfoliosync/prod/finnhub-key" --value "YOUR_REAL_KEY" --overwrite
   ```

3. **Configure Cognito User Pool**
   ```bash
   # Create Cognito User Pool and update SSM parameters
   aws ssm put-parameter --name "/portfoliosync/prod/cognito-user-pool-id" --value "us-east-1_XXXXXXXX" --overwrite
   aws ssm put-parameter --name "/portfoliosync/prod/cognito-client-id" --value "XXXXXXXXXXXXXXXX" --overwrite
   ```

### **📈 Post-Release Monitoring**

After v1.0.0 release, monitor:
- User registration patterns
- API usage patterns  
- Error rates and types
- Performance metrics
- Cost optimization opportunities

### **🚨 Emergency Contacts**

- **Technical Issues**: rtananthan@yahoo.com
- **AWS Account Issues**: Check IAM permissions
- **Domain Issues**: Check Route 53 configuration