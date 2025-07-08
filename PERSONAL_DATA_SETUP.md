# Personal Data Setup Guide

This investment tracker template separates personal data from the codebase to make it shareable and reusable.

## 🔒 Data Separation Strategy

### What's Protected
- **Personal investment data** is stored in `frontend/src/data/userData.json`
- **Environment variables** contain API keys and personal settings
- **AWS resource names** can be customized per user

### What's Shared
- **Sample data** in `frontend/src/data/sampleData.json` for demonstration
- **Application code** and components
- **Infrastructure templates** in `serverless.yml`

## 📁 Data Files Structure

```
frontend/src/data/
├── sampleData.json     # Demo data (committed to git)
└── userData.json       # Your personal data (ignored by git)
```

## 🚀 Getting Started

### 1. Copy Sample Data to Create Your Personal Data

```bash
# Create your personal data file
cp frontend/src/data/sampleData.json frontend/src/data/userData.json
```

### 2. Customize Your Data

Edit `frontend/src/data/userData.json` with your actual investment data:

```json
{
  "investments": {
    "stocks": { "value": 45000, "count": 8, "return": 15.2 },
    "etfs": { "value": 125000, "count": 4, "return": 12.8 },
    "properties": { "value": 850000, "count": 1, "return": 22.1 }
  },
  "properties": [
    {
      "id": 1,
      "address": "Your Property Address",
      "type": "residential",
      "purchasePrice": 650000,
      "currentValue": 850000,
      "purchaseDate": "2021-06-15",
      "return": 22.1,
      "returnDollar": 200000,
      "sqft": 2400,
      "bedrooms": 4,
      "bathrooms": 3
    }
  ],
  "recentActivity": [
    {
      "symbol": "Your Stock Symbol",
      "description": "Number of shares",
      "return": 12.5
    }
  ]
}
```

### 3. Environment Configuration

Copy and customize environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment (if needed)
cp frontend/.env.example frontend/.env.local
```

Update with your personal information:
- **OWNER_EMAIL**: Your email for cost alerts
- **API Keys**: Alpha Vantage, Finnhub API keys
- **AWS Region**: Your preferred AWS region

## 🔄 Data Loading Logic

The application automatically handles data loading:

1. **First try**: Load `userData.json` (your personal data)
2. **Fallback**: Load `sampleData.json` (demo data)  
3. **Error fallback**: Show empty state with prompts to add data

## 🔐 Security Best Practices

### Git Ignore Rules
The `.gitignore` file excludes:
```gitignore
# Personal data files
frontend/src/data/userData.json
personalData.json
myInvestments.json

# Environment files
.env
.env.local
*/.env
```

### Sharing the Template
When sharing this project:
1. ✅ **Include**: Sample data, application code, documentation
2. ❌ **Exclude**: Personal `userData.json`, `.env` files, AWS resource names

## 📊 Adding Your Investment Data

### Properties Data Structure
```json
{
  "id": 1,
  "address": "Full property address",
  "type": "residential|commercial|industrial", 
  "purchasePrice": 650000,
  "currentValue": 850000,
  "purchaseDate": "YYYY-MM-DD",
  "return": 22.1,
  "returnDollar": 200000,
  "sqft": 2400,
  "bedrooms": 4,  // null for commercial
  "bathrooms": 3
}
```

### Investment Summary Structure
```json
{
  "investments": {
    "stocks": { 
      "value": 45000,     // Total current value
      "count": 8,         // Number of holdings
      "return": 15.2      // Average return %
    },
    "etfs": { ... },
    "properties": { ... }
  }
}
```

## 🔄 Updating Your Data

### Manual Updates
Edit `frontend/src/data/userData.json` directly with current values.

### Future: Database Integration
When the backend is fully implemented, data will be stored in DynamoDB and managed through the web interface.

## 📝 Backup Your Data

Since `userData.json` is not committed to git:

```bash
# Create a backup
cp frontend/src/data/userData.json ~/backup-investment-data-$(date +%Y%m%d).json

# Or store in a private location
cp frontend/src/data/userData.json ~/Documents/Private/investment-backup.json
```

## 🌟 Template Customization

### Personalizing for Distribution

1. **Update README**: Add your name/organization
2. **Modify branding**: Update colors, logos, app name
3. **Add features**: Extend with your specific investment types
4. **Cost center tags**: Update AWS tags in `serverless.yml`

### AWS Resource Naming

Update the service name in `serverless.yml`:
```yaml
service: your-investment-tracker-backend
```

This ensures your AWS resources don't conflict with others using the template.

## 🆘 Troubleshooting

### Data Not Loading
1. Check if `userData.json` exists and is valid JSON
2. Verify file path: `frontend/src/data/userData.json`
3. Check browser console for loading errors
4. Fallback to sample data should work automatically

### Environment Issues
1. Ensure `.env` files are copied from `.env.example`
2. Verify API keys are valid
3. Check AWS credentials are configured

## 📋 Quick Setup Checklist

- [ ] Copy sample data to create userData.json
- [ ] Update userData.json with your investment data
- [ ] Copy and configure .env files
- [ ] Test locally: `npm run dev` in frontend
- [ ] Verify data loads correctly
- [ ] Deploy when ready: backend first, then frontend

Your personal investment data stays private while the template remains shareable! 🎉