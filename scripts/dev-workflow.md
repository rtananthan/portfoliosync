# Development Workflow Guide

## 🌳 **Branching Strategy**

```
main (production)
  ↑
develop (staging)
  ↑
feature/news-feed (your development)
```

## 🔄 **Daily Development Workflow**

### **1. Starting New Work**
```bash
# Switch to develop and pull latest
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/fix-news-api
# or
git checkout -b feature/add-property-analytics
```

### **2. Working with Claude**
```bash
# Make changes with Claude
# Test locally: npm run dev

# Commit your work regularly
git add .
git commit -m "Fix news API endpoint import issues"
```

### **3. Ready to Test in Staging**
```bash
# Push feature branch
git push origin feature/fix-news-api

# Merge to develop (triggers staging deployment)
git checkout develop
git merge feature/fix-news-api
git push origin develop
```

**→ Staging will auto-deploy via GitHub Actions**

### **4. Ready for Production**
```bash
# Merge develop to main (triggers production deployment)
git checkout main
git merge develop
git push origin main
```

**→ Production will auto-deploy via GitHub Actions**

## 🌍 **Environment Setup**

### **Current (Production)**
- **URL**: https://d1s0t04ct1krwo.cloudfront.net
- **API**: https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com
- **Stage**: `dev` (we'll keep using this as production for now)

### **Staging (New)**
- **URL**: Will be created automatically
- **API**: Will be created with `-staging` suffix
- **Stage**: `staging`

## 🚀 **Deployment Commands (Manual Fallback)**

### **Deploy to Staging**
```bash
# Backend
cd backend
serverless deploy --stage staging

# Frontend  
cd frontend
npm run build
aws s3 sync dist/ s3://investment-tracker-frontend-staging --delete
aws cloudfront create-invalidation --distribution-id STAGING_CLOUDFRONT_ID --paths "/*"
```

### **Deploy to Production**
```bash
# Backend
cd backend
serverless deploy --stage prod

# Frontend
cd frontend  
npm run build
aws s3 sync dist/ s3://investment-tracker-frontend-dev --delete
aws cloudfront create-invalidation --distribution-id E2A7VVR87NWEW1 --paths "/*"
```

## ⚡ **Quick Commands**

### **Start Development Session**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature
npm run dev  # in frontend/
```

### **Test & Push Changes**
```bash
npm run test:ci  # in frontend/
git add .
git commit -m "Descriptive commit message"
git push origin feature/my-new-feature
```

### **Deploy to Staging for Testing**
```bash
git checkout develop
git merge feature/my-new-feature
git push origin develop  # Auto-deploys to staging
```

### **Deploy to Production**
```bash
git checkout main
git merge develop
git push origin main  # Auto-deploys to production
```

## 🛠️ **Local Development Commands**

### **Frontend**
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests in watch mode
npm run test:ci      # Run tests once with coverage
npm run lint         # Check code quality
```

### **Backend**
```bash
cd backend
serverless invoke local --function getPortfolios  # Test function locally
serverless logs --function getPortfolios          # View logs
serverless deploy --stage local                   # Deploy to local stage
```

## 🔒 **Environment Variables Needed**

Add these to GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`  
- `STAGING_API_URL`
- `PRODUCTION_API_URL`
- `STAGING_S3_BUCKET`
- `PRODUCTION_S3_BUCKET`
- `STAGING_CLOUDFRONT_ID`
- `PRODUCTION_CLOUDFRONT_ID` (E2A7VVR87NWEW1)
- `ALPHA_VANTAGE_API_KEY`
- `FINNHUB_API_KEY`

## 📋 **Best Practices**

1. **Always work in feature branches**
2. **Test in staging before production**
3. **Write descriptive commit messages**
4. **Keep commits focused and small**
5. **Use staging for experimentation**
6. **Only merge to main when confident**

## 🚨 **Emergency Rollback**

If production breaks:
```bash
# Find last good commit
git log --oneline

# Revert to last good commit
git checkout main
git reset --hard LAST_GOOD_COMMIT_HASH
git push origin main --force
```