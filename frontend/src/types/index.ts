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
}