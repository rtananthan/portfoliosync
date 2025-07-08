# Investment Tracker - Cost Optimization Guide

## 📊 Complete Cost Tracking Setup

Every AWS resource in this application is tagged for precise cost tracking to the cent.

### 🏷️ Comprehensive Tagging Strategy

All resources are tagged with:

| Tag Key | Purpose | Example Value |
|---------|---------|---------------|
| `Application` | App identifier | `investment-tracker` |
| `Environment` | Stage/environment | `dev`, `staging`, `prod` |
| `Project` | Project grouping | `personal-finance` |
| `Owner` | Responsible person | `user@example.com` |
| `CostCenter` | Cost allocation | `investment-tracker-dev` |
| `Purpose` | Resource purpose | `frontend-hosting`, `api-gateway` |
| `ResourceType` | AWS resource type | `lambda-function`, `s3-bucket` |
| `CreatedBy` | Creation method | `serverless-framework` |
| `ManagedBy` | Management method | `infrastructure-as-code` |

### 💰 Cost Monitoring Features

#### 1. **Billing Alerts**
- 📧 Email notifications at $5 threshold
- 🚨 CloudWatch alarms for cost spikes
- 📈 Daily cost tracking

#### 2. **Budget Controls**
- 💵 $10 monthly budget with alerts
- ⚠️ 80% budget threshold warning
- 📊 100% forecasted spend alert

#### 3. **Cost Monitoring Script**
```bash
# Run cost analysis
python3 scripts/cost-monitor.py --days 7

# JSON output for automation
python3 scripts/cost-monitor.py --output json
```

## 🛠️ Cost Optimization Settings

### **Lambda Functions**
- ✅ **Memory**: 256MB (minimal for Python)
- ✅ **Timeout**: 30 seconds
- ✅ **Runtime**: Python 3.11 (fastest cold starts)
- ✅ **Architecture**: x86_64 (cost-optimized)

### **DynamoDB**
- ✅ **Billing**: Pay-per-request (no idle costs)
- ✅ **Backup**: Point-in-time recovery disabled (dev/staging)
- ✅ **Deletion Protection**: Enabled for production only

### **S3**
- ✅ **Intelligent Tiering**: Automatic cost optimization
- ✅ **Lifecycle Policy**: Delete incomplete uploads after 1 day
- ✅ **Compression**: Enabled via CloudFront

### **CloudFront**
- ✅ **Price Class**: 100 (US, Canada, Europe only)
- ✅ **Compression**: Enabled
- ✅ **Caching**: Optimized for static assets

### **API Gateway**
- ✅ **Type**: HTTP API (cheaper than REST API)
- ✅ **Caching**: Can be enabled if needed

## 💡 Cost Optimization Best Practices

### **Immediate Actions**
1. ✅ Set up billing alerts before deployment
2. ✅ Configure your email in `OWNER_EMAIL` environment variable
3. ✅ Review and adjust budget limits based on usage

### **Ongoing Monitoring**
1. **Weekly**: Run cost monitoring script
2. **Monthly**: Review budget vs actual spending
3. **Quarterly**: Optimize based on usage patterns

### **Advanced Optimizations**

#### **Lambda Optimization**
```python
# Monitor in CloudWatch:
- Duration
- Memory utilization
- Cold start frequency
- Error rates
```

#### **DynamoDB Optimization**
- Monitor read/write patterns
- Consider reserved capacity for predictable workloads
- Use sparse GSIs to reduce costs

#### **S3 Optimization**
- Enable request metrics for detailed analysis
- Use S3 Storage Class Analysis
- Consider S3 Transfer Acceleration if needed

#### **CloudFront Optimization**
- Monitor cache hit ratios
- Optimize TTL settings
- Use regional edge caches

## 📈 Expected Monthly Costs

### **Development Environment**
| Service | Usage | Est. Cost |
|---------|-------|-----------|
| Lambda | 1M requests, 256MB | $2.00 |
| DynamoDB | 1M read/write units | $1.25 |
| S3 | 1GB storage, 10K requests | $0.30 |
| CloudFront | 1GB transfer | $0.12 |
| API Gateway | 1M HTTP API calls | $1.00 |
| **Total** | | **~$4.67/month** |

### **Production Environment**
| Service | Usage | Est. Cost |
|---------|-------|-----------|
| Lambda | 10M requests, 256MB | $20.00 |
| DynamoDB | 10M read/write units | $12.50 |
| S3 | 5GB storage, 100K requests | $1.50 |
| CloudFront | 10GB transfer | $1.20 |
| API Gateway | 10M HTTP API calls | $10.00 |
| **Total** | | **~$45.20/month** |

## 🔍 Cost Tracking Commands

### **View Cost by Service**
```bash
# Last 7 days
python3 scripts/cost-monitor.py --days 7

# Last 30 days
python3 scripts/cost-monitor.py --days 30
```

### **AWS CLI Cost Queries**
```bash
# Get cost by tag
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --group-by Type=TAG,Key=CostCenter

# Get service-specific costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

### **Set Up Cost Anomaly Detection**
```bash
# Create anomaly detector
aws ce create-anomaly-detector \
  --anomaly-detector AnomalyDetectorArn=string,DimensionKey=SERVICE,MatchOptions=EQUALS,Values=AWSLambda
```

## 🚨 Cost Alerts Setup

### **Environment Variables Required**
```bash
export OWNER_EMAIL="your-email@example.com"
export AWS_REGION="us-east-1"
```

### **Alert Thresholds**
- 💰 **$5**: Daily spending alert
- 💰 **$8**: 80% of monthly budget ($10)
- 💰 **$10**: Monthly budget exceeded
- 💰 **$12**: Forecasted to exceed budget

## 📱 Mobile Cost Tracking

### **AWS Mobile App**
- Install AWS Console Mobile App
- Enable billing notifications
- Set up widget for quick cost viewing

### **Third-Party Tools**
- **CloudHealth**: Advanced cost analytics
- **CloudCheckr**: Multi-cloud cost management
- **AWS Cost Explorer**: Built-in AWS tool

## 🎯 Cost Optimization Targets

### **Short Term (1 month)**
- [ ] Achieve <$5/month for development
- [ ] Set up all billing alerts
- [ ] Optimize Lambda memory settings

### **Medium Term (3 months)**
- [ ] Implement auto-scaling based on usage
- [ ] Optimize DynamoDB capacity if needed
- [ ] Fine-tune CloudFront caching

### **Long Term (6 months)**
- [ ] Consider Reserved Instances for predictable workloads
- [ ] Implement multi-region optimization
- [ ] Advanced monitoring and analytics

## 🔧 Emergency Cost Controls

### **Immediate Actions if Costs Spike**
1. **Check CloudWatch billing alarms**
2. **Review Lambda execution patterns**
3. **Check for API abuse or loops**
4. **Temporarily disable scheduled functions**
5. **Review CloudFront request patterns**

### **Cost Circuit Breakers**
```python
# Add to Lambda functions for cost protection
import boto3

def check_daily_cost_limit():
    # Query current day costs
    # Raise exception if exceeded
    pass
```

## 📞 Support and Resources

- **AWS Cost Optimization**: https://aws.amazon.com/aws-cost-management/
- **Well-Architected Cost Pillar**: https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/
- **AWS Calculator**: https://calculator.aws/

Remember: **Every resource is tagged for precise cost attribution!** 🏷️💰