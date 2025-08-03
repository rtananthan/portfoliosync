# Investment Tracker - Version Management

## Current Version: 1.0.0-beta

## Semantic Versioning Strategy

### Version Format: MAJOR.MINOR.PATCH

**MAJOR** (1.x.x): Breaking changes
- New authentication system
- Database schema changes
- API breaking changes

**MINOR** (x.1.x): New features (backwards compatible)
- New asset types (crypto, bonds)
- Enhanced analytics
- New export formats

**PATCH** (x.x.1): Bug fixes and small improvements
- UI fixes
- Performance improvements
- Security patches

## Release History

### v1.0.0-beta (Current Dev)
- ✅ Portfolio management (stocks, ETFs, properties)
- ✅ Performance benchmarking vs ASX 200, S&P 500
- ✅ News feed with AI insights
- ✅ Data export (CSV, JSON, Excel)
- ✅ Search and filtering
- ✅ Input validation and error handling

### v1.0.0 (Planned Production Release)
- 🎯 Clean production database
- 🎯 Production security (authentication enabled)
- 🎯 Professional UI polish
- 🎯 Real-time market data integration
- 🎯 Australian tax compliance features

### Future Roadmap

#### v1.1.0 - Enhanced Analytics
- Advanced portfolio analytics
- Risk assessment tools
- Performance attribution

#### v1.2.0 - Broker Integration
- CommSec API integration
- Automated transaction import
- Real-time sync

#### v2.0.0 - Multi-user Platform
- User registration/authentication
- Multi-tenant architecture
- Subscription tiers

## Branch Strategy

### Main Branches
- `main` - Production releases (v1.0.0, v1.1.0, etc.)
- `develop` - Integration branch for new features
- `staging` - Pre-production testing

### Feature Branches
- `feature/tax-reporting` - Australian tax calculations
- `feature/crypto-support` - Cryptocurrency tracking
- `hotfix/security-patch` - Critical production fixes

## Environment Mapping
- `main` branch → Production (`prod` stage)
- `develop` branch → Development (`dev` stage)  
- `staging` branch → Staging (`staging` stage)