# Authentication Setup Guide

## Overview
This guide helps you set up secure authentication for your investment tracker with AWS Cognito, social login, and financial-grade security.

## Features Implemented

### 🔐 Authentication & Security
- **AWS Cognito User Pool** with advanced security features
- **Social Login**: Google and Facebook OAuth integration
- **JWT Token Management** with automatic refresh
- **Financial-Grade Security**: Strong passwords, MFA, encryption
- **Development/Production Toggle** for easy testing

### 🛡️ Security Features
- **Strong Password Policy**: 12+ characters with complexity requirements
- **Multi-Factor Authentication (MFA)**: SMS and TOTP support
- **Advanced Security**: AWS Cognito security monitoring
- **Data Encryption**: Sensitive data encrypted at rest
- **Audit Logging**: All financial activities logged
- **Session Management**: Secure token handling with expiration

## Setup Steps

### 1. Environment Variables

Create environment files for your specific configuration:

**Frontend (.env.development)**:
```bash
# Development - Authentication disabled for easy testing
VITE_AUTH_ENABLED=false
VITE_DEV_MODE=true
VITE_API_URL=https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com
VITE_AWS_REGION=ap-southeast-2
```

**Frontend (.env.production)**:
```bash
# Production - Authentication enabled
VITE_AUTH_ENABLED=true
VITE_DEV_MODE=false
VITE_API_URL=https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com
VITE_AWS_REGION=ap-southeast-2
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_COGNITO_DOMAIN=your-cognito-domain
```

**Backend Environment Variables**:
```bash
# Add to your deployment environment
AUTH_ENABLED=true
JWT_SECRET=your-secure-jwt-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 2. Social Login Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - `https://d1s0t04ct1krwo.cloudfront.net/auth/callback`
   - `http://localhost:3000/auth/callback`

#### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - `https://d1s0t04ct1krwo.cloudfront.net/auth/callback`
   - `http://localhost:3000/auth/callback`

### 3. Deploy Backend

```bash
cd backend
serverless deploy --stage prod
```

This will create:
- Cognito User Pool with security features
- Social identity providers (Google, Facebook)
- User management APIs
- Authentication middleware
- Encrypted user data storage

### 4. Configure Frontend

After deployment, update your frontend environment variables with the Cognito outputs:

```bash
# Get these values from the serverless deployment output
VITE_COGNITO_USER_POOL_ID=us-west-2_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=portfoliosync-prod-auth
```

### 5. Build and Deploy Frontend

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://investment-tracker-frontend-dev --delete
aws cloudfront create-invalidation --distribution-id E2A7VVR87NWEW1 --paths "/*"
```

## Usage

### Development Mode
- Set `VITE_AUTH_ENABLED=false` in `.env.development`
- Authentication is bypassed with mock user data
- Perfect for development and testing

### Production Mode
- Set `VITE_AUTH_ENABLED=true` in `.env.production`
- Full authentication and security enabled
- Users must sign in to access the application

### User Authentication Flow
1. **Sign Up**: Users create account with email/password or social login
2. **Email Verification**: Cognito sends verification email
3. **Sign In**: Users authenticate with credentials or social providers
4. **Profile Management**: Users can update their profile and preferences
5. **Secure Access**: All API calls include JWT tokens for authentication

### API Security
- All portfolio data APIs require authentication
- JWT tokens validated against Cognito
- User data isolation - users only see their own data
- Financial activities logged for audit compliance

## Security Compliance

### Financial Industry Standards
- **Strong Authentication**: Multi-factor authentication support
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Audit Logging**: All financial activities tracked with timestamps
- **Session Management**: Secure token handling with automatic expiration
- **Access Control**: Fine-grained permissions for data access

### Password Policy
- Minimum 12 characters
- Requires uppercase, lowercase, numbers, and symbols
- Account lockout after failed attempts
- Password history prevention

### Data Protection
- **Encryption**: Sensitive data encrypted with AES-256
- **Access Logs**: All data access logged with user context
- **Data Isolation**: Strict user data separation
- **Backup Security**: Encrypted backups with point-in-time recovery

## Testing

### Development Testing
```bash
# Start with auth disabled
VITE_AUTH_ENABLED=false npm run dev
```

### Production Testing
```bash
# Test with auth enabled
VITE_AUTH_ENABLED=true npm run dev
```

### Security Testing
- Test password policy enforcement
- Verify MFA setup flow
- Test social login integration
- Verify token expiration handling
- Test data isolation between users

## Monitoring

### CloudWatch Metrics
- Authentication attempts
- Failed login attempts
- User session duration
- API access patterns

### Security Alerts
- Billing alerts for cost monitoring
- Failed authentication alerts
- Unusual access pattern detection

## Support

For issues or questions:
1. Check the development console for authentication errors
2. Verify environment variables are set correctly
3. Test with authentication disabled first
4. Check AWS CloudWatch logs for backend errors

## Next Steps

1. **Deploy to Production**: Follow the deployment steps above
2. **Configure Social Login**: Set up Google/Facebook OAuth
3. **Test Security Features**: Verify MFA and strong authentication
4. **Monitor Usage**: Set up CloudWatch dashboards
5. **User Training**: Provide users with login instructions

---

**Security Note**: This implementation follows financial industry security standards and includes features like data encryption, audit logging, and multi-factor authentication. The system is designed to be both secure for production use and flexible for development testing.