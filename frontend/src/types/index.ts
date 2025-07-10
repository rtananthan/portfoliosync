export interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;        // Original purchase price per share
  purchaseDate: string;         // Date when stock was purchased
  purchaseFees?: number;        // Brokerage fees and commissions
  averagePrice: number;         // For backward compatibility
  currentPrice: number;
  currency?: string;            // Currency code (USD, AUD, etc.)
  exchange?: string;            // Stock exchange (NASDAQ, NYSE, ASX, etc.)
  sector?: string;              // Industry sector
  totalCostBasis: number;       // (purchasePrice * quantity) + purchaseFees
  totalValue: number;           // currentPrice * quantity
  totalReturn: number;          // totalValue - totalCostBasis
  returnPercentage: number;     // (totalReturn / totalCostBasis) * 100
  daysHeld?: number;            // Days since purchase
  tags: string[];               // Array of tag IDs
  createdAt: string;
  updatedAt: string;
}

export interface ETF {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;          // Original purchase price per share
  purchaseDate: string;           // Date when ETF was purchased
  purchaseFees?: number;          // Brokerage fees and commissions
  averagePrice: number;           // For backward compatibility
  currentPrice: number;
  currency?: string;              // Currency code (USD, AUD, etc.)
  exchange?: string;              // Exchange (NASDAQ, NYSE, ASX, etc.)
  expenseRatio?: number;          // Annual expense ratio (e.g., 0.03 for 0.03%)
  distributionFrequency?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'none';
  lastDistributionAmount?: number; // Last distribution per share
  lastDistributionDate?: string;   // Date of last distribution
  category?: string;              // ETF category (Large Cap, International, Bond, etc.)
  totalCostBasis: number;         // (purchasePrice * quantity) + purchaseFees
  totalValue: number;             // currentPrice * quantity
  totalReturn: number;            // totalValue - totalCostBasis
  returnPercentage: number;       // (totalReturn / totalCostBasis) * 100
  annualExpenseCost?: number;     // (totalValue * expenseRatio) / 100
  daysHeld?: number;              // Days since purchase
  tags: string[];                 // Array of tag IDs
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  address: string;
  propertyType: 'house' | 'unit' | 'townhouse' | 'duplex' | 'commercial' | 'land' | 'rural';
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  
  // Property Details
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  landSize?: number;           // Square meters
  floorArea?: number;          // Built-up area in square meters
  yearBuilt?: number;
  councilArea?: string;
  
  // Purchase Costs (Australian specific)
  stampDuty?: number;
  legalFees?: number;
  otherPurchaseCosts?: number;
  totalPurchaseCosts: number;  // purchasePrice + all additional costs
  
  // Rental Information
  weeklyRent?: number;
  annualRentalIncome: number;
  tenantName?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  bondAmount?: number;
  propertyManager?: string;
  managementFeePercentage?: number;
  
  // Ongoing Expenses (Annual)
  councilRates?: number;
  waterRates?: number;
  insurance?: number;
  propertyManagementFees?: number;
  maintenanceRepairs?: number;
  strataFees?: number;        // Body corporate fees for units
  landTax?: number;           // Investment property land tax
  totalAnnualExpenses: number;
  
  // Calculated Fields
  capitalGrowth: number;              // currentValue - totalPurchaseCosts
  capitalGrowthPercentage: number;    // (capitalGrowth / totalPurchaseCosts) * 100
  grossRentalYield: number;           // (annualRentalIncome / currentValue) * 100
  netRentalYield: number;             // ((annualRentalIncome - totalAnnualExpenses) / currentValue) * 100
  annualCashFlow: number;             // annualRentalIncome - totalAnnualExpenses
  totalReturn: number;                // capitalGrowth + (total rental income - total expenses)
  returnPercentage: number;           // (totalReturn / totalPurchaseCosts) * 100
  daysHeld?: number;                  // Days since purchase
  
  // Valuation Information
  valuationDate?: string;
  valuationMethod?: 'professional' | 'online' | 'council' | 'estimate';
  
  // Tagging
  tags: string[];                         // Array of tag IDs
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  date: string;
  price: number;
  symbol: string;
}

export interface InvestmentSummary {
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  stocksValue: number;
  etfsValue: number;
  propertiesValue: number;
  stocksCount: number;
  etfsCount: number;
  propertiesCount: number;
}

export type InvestmentType = 'stock' | 'etf' | 'property';

export interface CreateStockRequest {
  symbol: string;
  name?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  purchaseFees?: number;
  averagePrice?: number;        // For backward compatibility
  currentPrice?: number;
  currency?: string;
  exchange?: string;
  sector?: string;
  tags?: string[];              // Array of tag IDs
}

export interface CreateETFRequest {
  symbol: string;
  name?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  purchaseFees?: number;
  averagePrice?: number;          // For backward compatibility
  currentPrice?: number;
  currency?: string;
  exchange?: string;
  expenseRatio?: number;
  distributionFrequency?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'none';
  lastDistributionAmount?: number;
  lastDistributionDate?: string;
  category?: string;
  tags?: string[];                // Array of tag IDs
}

export interface CreatePropertyRequest {
  address: string;
  propertyType: 'house' | 'unit' | 'townhouse' | 'duplex' | 'commercial' | 'land' | 'rural';
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  
  // Property Details
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  landSize?: number;
  floorArea?: number;
  yearBuilt?: number;
  councilArea?: string;
  
  // Purchase Costs
  stampDuty?: number;
  legalFees?: number;
  otherPurchaseCosts?: number;
  
  // Rental Information
  weeklyRent?: number;
  tenantName?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  bondAmount?: number;
  propertyManager?: string;
  managementFeePercentage?: number;
  
  // Annual Expenses
  councilRates?: number;
  waterRates?: number;
  insurance?: number;
  propertyManagementFees?: number;
  maintenanceRepairs?: number;
  strataFees?: number;
  landTax?: number;
  
  // Valuation Information
  valuationDate?: string;
  valuationMethod?: 'professional' | 'online' | 'council' | 'estimate';
  
  // Tags
  tags?: string[];                // Array of tag IDs
}

// Portfolio Groups System for Family/Team/Business Investment Management
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface PortfolioGroup {
  id: string;
  name: string;
  description?: string;
  type: 'family' | 'business' | 'investment_club' | 'partnership' | 'trust' | 'other';
  isDefault?: boolean;        // Primary/default group for user
  
  // Visual customization
  color?: string;             // Theme color for group
  avatar?: string;            // Group photo/logo
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;          // User ID who created the group
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: GroupPermissions;
  
  // Member details
  displayName?: string;       // Custom name within this group (e.g., "Dad", "Business Partner")
  joinedAt: string;
  invitedBy: string;          // User ID who invited them
  status: 'active' | 'invited' | 'suspended';
  
  // Invitation
  inviteEmail?: string;       // Email used for invitation
  inviteAcceptedAt?: string;  // When they accepted
}

export interface GroupPermissions {
  // View permissions
  canViewStocks: boolean;
  canViewETFs: boolean;
  canViewProperties: boolean;
  canViewReports: boolean;
  canViewSensitiveData: boolean;  // Tax info, exact values vs percentages
  
  // Edit permissions
  canAddInvestments: boolean;
  canEditInvestments: boolean;
  canDeleteInvestments: boolean;
  
  // Group management
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canEditGroupSettings: boolean;
  canDeleteGroup: boolean;
  
  // Data export
  canExportData: boolean;
  canViewAuditLog: boolean;
}

export interface Portfolio {
  id: string;
  name: string;                // e.g., "John's Portfolio", "Joint Investments", "Kids Education Fund"
  groupId: string;             // Which group this portfolio belongs to
  ownerId: string;             // Primary owner/manager
  
  type: 'individual' | 'joint' | 'trust' | 'business' | 'smsf' | 'other';
  isActive: boolean;
  
  // Portfolio settings
  baseCurrency: string;        // AUD, USD, etc.
  riskProfile?: 'conservative' | 'moderate' | 'aggressive' | 'custom';
  
  // Privacy settings
  isPrivate: boolean;          // Hide from group aggregated views
  privateToMembers?: string[]; // Only show to specific member IDs
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface GroupAggregation {
  groupId: string;
  
  // Combined portfolio metrics
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  
  // Asset breakdown
  stocksValue: number;
  etfsValue: number;
  propertiesValue: number;
  
  // Count by asset type
  stocksCount: number;
  etfsCount: number;
  propertiesCount: number;
  
  // Count by portfolio
  portfoliosCount: number;
  activePortfoliosCount: number;
  
  // Member breakdown
  membersCount: number;
  activeMembersCount: number;
  
  // Performance by portfolio
  portfolioPerformance: {
    portfolioId: string;
    portfolioName: string;
    ownerName: string;
    value: number;
    return: number;
    returnPercentage: number;
  }[];
  
  // Asset allocation across all portfolios
  assetAllocation: {
    stocks: { value: number; percentage: number };
    etfs: { value: number; percentage: number };
    properties: { value: number; percentage: number };
  };
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  inviterUserId: string;
  inviterName: string;
  inviteEmail: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: GroupPermissions;
  
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;           // Personal message from inviter
  
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

// Activity tracking for group portfolios
export interface GroupActivity {
  id: string;
  groupId: string;
  portfolioId?: string;
  userId: string;
  userName: string;
  
  action: 'added_stock' | 'added_etf' | 'added_property' | 'updated_investment' | 'deleted_investment' | 
          'created_portfolio' | 'joined_group' | 'invited_member' | 'changed_permissions' | 'exported_data';
  
  entityType?: 'stock' | 'etf' | 'property' | 'portfolio' | 'member';
  entityId?: string;
  entityName?: string;
  
  details: string;            // Human-readable description
  metadata?: Record<string, any>; // Additional data for the action
  
  createdAt: string;
}

// Default permission templates
export const DEFAULT_PERMISSIONS: Record<string, GroupPermissions> = {
  owner: {
    canViewStocks: true,
    canViewETFs: true,
    canViewProperties: true,
    canViewReports: true,
    canViewSensitiveData: true,
    canAddInvestments: true,
    canEditInvestments: true,
    canDeleteInvestments: true,
    canInviteMembers: true,
    canManageMembers: true,
    canEditGroupSettings: true,
    canDeleteGroup: true,
    canExportData: true,
    canViewAuditLog: true,
  },
  admin: {
    canViewStocks: true,
    canViewETFs: true,
    canViewProperties: true,
    canViewReports: true,
    canViewSensitiveData: true,
    canAddInvestments: true,
    canEditInvestments: true,
    canDeleteInvestments: true,
    canInviteMembers: true,
    canManageMembers: true,
    canEditGroupSettings: false,
    canDeleteGroup: false,
    canExportData: true,
    canViewAuditLog: true,
  },
  editor: {
    canViewStocks: true,
    canViewETFs: true,
    canViewProperties: true,
    canViewReports: true,
    canViewSensitiveData: false,
    canAddInvestments: true,
    canEditInvestments: true,
    canDeleteInvestments: false,
    canInviteMembers: false,
    canManageMembers: false,
    canEditGroupSettings: false,
    canDeleteGroup: false,
    canExportData: false,
    canViewAuditLog: false,
  },
  viewer: {
    canViewStocks: true,
    canViewETFs: true,
    canViewProperties: true,
    canViewReports: true,
    canViewSensitiveData: false,
    canAddInvestments: false,
    canEditInvestments: false,
    canDeleteInvestments: false,
    canInviteMembers: false,
    canManageMembers: false,
    canEditGroupSettings: false,
    canDeleteGroup: false,
    canExportData: false,
    canViewAuditLog: false,
  },
}

// ============ ASSET TAGGING SYSTEM ============

export interface AssetTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  category: 'strategy' | 'timeframe' | 'purpose' | 'risk' | 'geographic' | 'tax' | 'custom';
  isDefault: boolean;        // Pre-defined system tags vs user-created
  isArchived: boolean;       // Soft delete for user tags
  
  // Usage statistics
  usageCount?: number;       // How many assets use this tag
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;        // User ID who created (null for system tags)
}

export interface TagCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  order: number;
}

export interface TaggedAssetSummary {
  tagId: string;
  tagName: string;
  tagColor: string;
  
  // Asset counts
  stocksCount: number;
  etfsCount: number;
  propertiesCount: number;
  totalAssetsCount: number;
  
  // Financial metrics
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  
  // Performance metrics
  bestPerformer: {
    id: string;
    name: string;
    type: 'stock' | 'etf' | 'property';
    returnPercentage: number;
  } | null;
  
  worstPerformer: {
    id: string;
    name: string;
    type: 'stock' | 'etf' | 'property';
    returnPercentage: number;
  } | null;
}

// Pre-defined tag categories and default tags
export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'strategy',
    name: 'Investment Strategy',
    description: 'Investment approach and methodology',
    color: '#3B82F6',
    icon: 'TrendingUp',
    order: 1
  },
  {
    id: 'timeframe',
    name: 'Time Horizon',
    description: 'Expected holding period',
    color: '#10B981',
    icon: 'Clock',
    order: 2
  },
  {
    id: 'purpose',
    name: 'Investment Purpose',
    description: 'Goal or objective for this investment',
    color: '#8B5CF6',
    icon: 'Target',
    order: 3
  },
  {
    id: 'risk',
    name: 'Risk Profile',
    description: 'Risk level and volatility expectation',
    color: '#F59E0B',
    icon: 'AlertTriangle',
    order: 4
  },
  {
    id: 'geographic',
    name: 'Geographic Focus',
    description: 'Regional or market exposure',
    color: '#EF4444',
    icon: 'Globe',
    order: 5
  },
  {
    id: 'tax',
    name: 'Tax Strategy',
    description: 'Australian tax optimization approach',
    color: '#6366F1',
    icon: 'Calculator',
    order: 6
  }
]

export const DEFAULT_TAGS: Omit<AssetTag, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Strategy Tags
  { name: 'Growth', description: 'Capital appreciation focused', color: '#059669', category: 'strategy', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Income', description: 'Dividend/distribution focused', color: '#0891B2', category: 'strategy', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Value', description: 'Undervalued securities', color: '#7C3AED', category: 'strategy', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Momentum', description: 'Trend following approach', color: '#DC2626', category: 'strategy', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Speculation', description: 'High risk/reward bets', color: '#EA580C', category: 'strategy', isDefault: true, isArchived: false, usageCount: 0 },
  
  // Timeframe Tags
  { name: 'Short-term (<1yr)', description: 'Less than 12 months', color: '#EF4444', category: 'timeframe', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Medium-term (1-5yr)', description: '1 to 5 years', color: '#F59E0B', category: 'timeframe', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Long-term (5yr+)', description: '5+ years', color: '#10B981', category: 'timeframe', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Buy & Hold', description: 'Long-term ownership', color: '#059669', category: 'timeframe', isDefault: true, isArchived: false, usageCount: 0 },
  
  // Purpose Tags
  { name: 'Retirement', description: 'Retirement savings', color: '#6366F1', category: 'purpose', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'House Deposit', description: 'Property purchase fund', color: '#DC2626', category: 'purpose', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Kids Education', description: 'Education fund', color: '#7C3AED', category: 'purpose', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Emergency Fund', description: 'Financial safety net', color: '#059669', category: 'purpose', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Wealth Building', description: 'General wealth accumulation', color: '#0891B2', category: 'purpose', isDefault: true, isArchived: false, usageCount: 0 },
  
  // Risk Tags
  { name: 'Conservative', description: 'Low volatility, stable returns', color: '#10B981', category: 'risk', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Moderate', description: 'Balanced risk/return', color: '#F59E0B', category: 'risk', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Aggressive', description: 'High volatility, high potential', color: '#EF4444', category: 'risk', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Blue Chip', description: 'Large, stable companies', color: '#3B82F6', category: 'risk', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Small Cap', description: 'Small company exposure', color: '#F59E0B', category: 'risk', isDefault: true, isArchived: false, usageCount: 0 },
  
  // Geographic Tags
  { name: 'ASX 200', description: 'Australian large caps', color: '#059669', category: 'geographic', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Australian Small Caps', description: 'ASX small companies', color: '#0891B2', category: 'geographic', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'US Markets', description: 'United States exposure', color: '#3B82F6', category: 'geographic', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'International', description: 'Global diversification', color: '#7C3AED', category: 'geographic', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Emerging Markets', description: 'Developing economies', color: '#DC2626', category: 'geographic', isDefault: true, isArchived: false, usageCount: 0 },
  
  // Australian Tax Strategy Tags
  { name: 'CGT Discount Eligible', description: 'Held >12 months for 50% CGT discount', color: '#059669', category: 'tax', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Tax Loss Harvesting', description: 'Potential for offsetting gains', color: '#EF4444', category: 'tax', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Franking Credits', description: 'Australian dividend imputation', color: '#3B82F6', category: 'tax', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'SMSF Eligible', description: 'Suitable for self-managed super', color: '#6366F1', category: 'tax', isDefault: true, isArchived: false, usageCount: 0 },
  { name: 'Negative Gearing', description: 'Property tax deduction strategy', color: '#7C3AED', category: 'tax', isDefault: true, isArchived: false, usageCount: 0 }
]

// ============ NEWS FEED SYSTEM ============

export interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  analyzedAt?: string;
  
  // AI-generated insights
  recommendation?: 'BUY' | 'SELL' | 'HOLD';
  confidence?: number;              // 0-100 confidence percentage
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  keyPoints?: string[];             // Array of key investment insights
  priceTarget?: number;             // Optional price target from AI analysis
  reasoning?: string;               // AI reasoning for recommendation
  
  // Metadata
  assetType: 'stock' | 'etf';      // Type of asset this news relates to
  status: 'pending_analysis' | 'analyzed' | 'error';
  tags: string[];                  // News category tags (earnings, analyst-rating, etc.)
  ttl?: number;                    // Time-to-live for automatic cleanup
  
  // AI model information
  analysisMethod?: string;         // Which AI model/method was used
  modelVersion?: string;           // Version of the analysis model
  
  // Raw data for reference
  rawData?: Record<string, any>;   // Original news data from external source
}

export interface NewsInsights {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  keyPoints: string[];
  priceTarget?: number;
  reasoning: string;
  analysisMethod: string;
  modelVersion: string;
}

export interface NewsFeedRequest {
  symbol?: string;                 // Get news for specific symbol
  symbols?: string[];              // Get news for multiple symbols
  limit?: number;                  // Number of items to return (default: 20)
  days?: number;                   // Number of days back to fetch (default: 3)
  status?: 'pending_analysis' | 'analyzed' | 'error';
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface NewsFeedResponse {
  news: NewsItem[];
  newsBySymbol?: Record<string, NewsItem[]>;
  count: number;
  symbolCount?: number;
  dateRange: {
    from: string;
    to: string;
  };
  requestedSymbols?: string[];
}

export interface NewsSymbolResponse {
  symbol: string;
  news: NewsItem[];
  count: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface NewsRefreshResponse {
  message: string;
  successful: number;
  total: number;
  results: NewsRefreshResult[];
  isScheduled: boolean;
}

export interface NewsRefreshResult {
  symbol: string;
  success: boolean;
  action: 'refreshed' | 'skipped' | 'no_news';
  newItems?: number;
  totalFetched?: number;
  recentCount?: number;
  reason?: string;
  error?: string;
}

export interface NewsInsightsResponse {
  symbol: string;
  message: string;
  processed: number;
  total: number;
  insights: NewsInsightResult[];
}

export interface NewsInsightResult {
  newsId: string;
  headline: string;
  insights: NewsInsights;
}

// News widget configuration for dashboard and detail pages
export interface NewsWidgetConfig {
  symbol?: string;                 // Show news for specific symbol
  maxItems?: number;               // Maximum news items to display
  showRecommendations?: boolean;   // Display AI recommendations
  showSentiment?: boolean;         // Display sentiment indicators
  showInsights?: boolean;          // Display key points
  timeframe?: number;              // Days of news to show
  layout?: 'card' | 'list' | 'compact';
}

// News preferences for user customization
export interface NewsPreferences {
  enableNotifications: boolean;    // Push notifications for important news
  notificationTypes: string[];     // Which types of news to notify about
  autoRefresh: boolean;            // Automatically refresh news feed
  refreshInterval: number;         // Minutes between auto-refresh
  defaultTimeframe: number;        // Default days of news to show
  showMockData: boolean;           // Show mock data for testing
  preferredSources: string[];      // Preferred news sources to prioritize
}

// News analytics for tracking engagement
export interface NewsAnalytics {
  totalViews: number;              // Total news item views
  clickThroughs: number;           // Links clicked to external sources
  recommendationAccuracy: number;  // Accuracy of AI recommendations
  userFeedback: {
    helpful: number;
    notHelpful: number;
    total: number;
  };
  topPerformingSources: {
    source: string;
    views: number;
    clickThroughs: number;
  }[];
  mostEngagingTopics: string[];    // Most viewed news categories
}