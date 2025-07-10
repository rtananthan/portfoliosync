// Simplified dummy data for quick testing and visualization
import { Stock, ETF, Property } from '../types'

// Basic dummy stocks for testing scenarios
export const DUMMY_STOCKS: Stock[] = [
  {
    id: '1',
    symbol: 'CBA.AX',
    name: 'Commonwealth Bank of Australia',
    quantity: 50,
    purchasePrice: 85.50,
    averagePrice: 85.50,
    currentPrice: 105.20,
    purchaseDate: '2023-01-15',
    totalCostBasis: 4275,
    totalValue: 5260,
    totalReturn: 985,
    returnPercentage: 23.04,
    exchange: 'ASX',
    sector: 'Financial Services',
    tags: ['tag_2', 'tag_17', 'tag_22', 'tag_25'],  // Income, Conservative, ASX 200, CGT Discount Eligible
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    symbol: 'AAPL',
    name: 'Apple Inc',
    quantity: 30,
    purchasePrice: 150.00,
    averagePrice: 150.00,
    currentPrice: 195.50,
    purchaseDate: '2022-11-10',
    totalCostBasis: 4500,
    totalValue: 5865,
    totalReturn: 1365,
    returnPercentage: 30.33,
    exchange: 'NASDAQ',
    sector: 'Technology',
    tags: ['tag_1', 'tag_18', 'tag_25', 'tag_8'],  // Growth, Aggressive, US Markets, Long-term
    createdAt: '2022-11-10T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    symbol: 'ZIP.AX',
    name: 'Zip Co Limited',
    quantity: 200,
    purchasePrice: 5.80,
    averagePrice: 5.80,
    currentPrice: 2.45,
    purchaseDate: '2023-01-08',
    totalCostBasis: 1160,
    totalValue: 490,
    totalReturn: -670,
    returnPercentage: -57.76,
    exchange: 'ASX',
    sector: 'Technology',
    tags: ['tag_5', 'tag_18', 'tag_23', 'tag_26'],  // Speculation, Aggressive, Australian Small Caps, Tax Loss Harvesting
    createdAt: '2023-01-08T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
]

// Basic dummy ETFs for testing
export const DUMMY_ETFS: ETF[] = [
  {
    id: '1',
    symbol: 'VAS.AX',
    name: 'Vanguard Australian Shares Index ETF',
    quantity: 100,
    purchasePrice: 78.50,
    averagePrice: 78.50,
    currentPrice: 82.30,
    purchaseDate: '2023-01-20',
    totalCostBasis: 7850,
    totalValue: 8230,
    totalReturn: 380,
    returnPercentage: 4.84,
    expenseRatio: 0.10,
    distributionFrequency: 'quarterly',
    lastDistributionAmount: 1.85,
    lastDistributionDate: '2024-06-30',
    annualExpenseCost: 8.23,
    exchange: 'ASX',
    tags: ['tag_2', 'tag_17', 'tag_22', 'tag_8'],  // Income, Conservative, ASX 200, Long-term
    category: 'Australian Equity',
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    quantity: 40,
    purchasePrice: 185.00,
    averagePrice: 185.00,
    currentPrice: 210.25,
    purchaseDate: '2023-02-15',
    totalCostBasis: 7400,
    totalValue: 8410,
    totalReturn: 1010,
    returnPercentage: 13.65,
    expenseRatio: 0.03,
    distributionFrequency: 'quarterly',
    lastDistributionAmount: 0.95,
    lastDistributionDate: '2024-09-25',
    annualExpenseCost: 2.52,
    exchange: 'NYSE',
    category: 'US Total Market',
    tags: ['tag_1', 'tag_18', 'tag_25', 'tag_8'],  // Growth, Moderate, US Markets, Long-term
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
]

// Basic dummy properties for testing
export const DUMMY_PROPERTIES: Property[] = [
  {
    id: '1',
    address: '15 Collins Street, Melbourne VIC 3000',
    propertyType: 'unit',
    bedrooms: 2,
    bathrooms: 2,
    carSpaces: 1,
    landSize: 0,
    floorArea: 85,
    purchasePrice: 650000,
    currentValue: 720000,
    purchaseDate: '2022-03-15',
    stampDuty: 32500,
    legalFees: 2800,
    otherPurchaseCosts: 3900,
    totalPurchaseCosts: 689200,
    weeklyRent: 720,
    annualRentalIncome: 37440,
    managementFeePercentage: 7,
    councilRates: 1800,
    waterRates: 650,
    insurance: 1200,
    propertyManagementFees: 2620,
    maintenanceRepairs: 2500,
    totalAnnualExpenses: 8770,
    capitalGrowth: 30800,
    capitalGrowthPercentage: 4.47,
    grossRentalYield: 5.2,
    netRentalYield: 3.98,
    annualCashFlow: 28670,
    totalReturn: 59470,
    returnPercentage: 8.63,
    yearBuilt: 2018,
    tags: ['tag_2', 'tag_17', 'tag_8', 'tag_10', 'tag_29'],  // Income, Conservative, Long-term, Retirement, Negative Gearing
    createdAt: '2022-03-15T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    address: '42 Smith Street, Fitzroy VIC 3065',
    propertyType: 'townhouse',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    landSize: 150,
    floorArea: 120,
    purchasePrice: 850000,
    currentValue: 925000,
    purchaseDate: '2022-08-10',
    stampDuty: 45500,
    legalFees: 3200,
    otherPurchaseCosts: 4100,
    totalPurchaseCosts: 902800,
    weeklyRent: 850,
    annualRentalIncome: 44200,
    managementFeePercentage: 7,
    councilRates: 2200,
    waterRates: 750,
    insurance: 1800,
    propertyManagementFees: 3094,
    maintenanceRepairs: 3500,
    totalAnnualExpenses: 11344,
    capitalGrowth: 22200,
    capitalGrowthPercentage: 2.46,
    grossRentalYield: 4.78,
    netRentalYield: 3.55,
    annualCashFlow: 32856,
    totalReturn: 55056,
    returnPercentage: 6.10,
    yearBuilt: 2019,
    tags: ['tag_2', 'tag_18', 'tag_8', 'tag_11', 'tag_29'],  // Income, Moderate, Long-term, House Deposit, Negative Gearing
    createdAt: '2022-08-10T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
]

// Test scenarios for different portfolio states
export const SCENARIO_DATA = {
  empty: {
    stocks: [],
    etfs: [],
    properties: []
  },
  balanced: {
    stocks: DUMMY_STOCKS,
    etfs: DUMMY_ETFS,
    properties: DUMMY_PROPERTIES
  },
  singleStock: [DUMMY_STOCKS[0]],
  majorLosses: [DUMMY_STOCKS[2]], // ZIP.AX with -57% loss
  majorGains: [DUMMY_STOCKS[1]]   // AAPL with +30% gain
}

// Helper function to calculate totals
export const calculatePortfolioTotals = () => {
  const stocksTotal = DUMMY_STOCKS.reduce((sum, stock) => sum + stock.totalValue, 0)
  const stocksReturn = DUMMY_STOCKS.reduce((sum, stock) => sum + stock.totalReturn, 0)
  
  const etfsTotal = DUMMY_ETFS.reduce((sum, etf) => sum + etf.totalValue, 0)
  const etfsReturn = DUMMY_ETFS.reduce((sum, etf) => sum + etf.totalReturn, 0)
  
  const propertiesTotal = DUMMY_PROPERTIES.reduce((sum, property) => sum + property.currentValue, 0)
  const propertiesReturn = DUMMY_PROPERTIES.reduce((sum, property) => sum + property.totalReturn, 0)
  
  const grandTotal = stocksTotal + etfsTotal + propertiesTotal
  const totalReturn = stocksReturn + etfsReturn + propertiesReturn
  
  return {
    stocks: { total: stocksTotal, return: stocksReturn, count: DUMMY_STOCKS.length },
    etfs: { total: etfsTotal, return: etfsReturn, count: DUMMY_ETFS.length },
    properties: { total: propertiesTotal, return: propertiesReturn, count: DUMMY_PROPERTIES.length },
    portfolio: { total: grandTotal, return: totalReturn, returnPercentage: (totalReturn / (grandTotal - totalReturn)) * 100 }
  }
}

export const DUMMY_DATA_SUMMARY = {
  totalAssets: DUMMY_STOCKS.length + DUMMY_ETFS.length + DUMMY_PROPERTIES.length,
  scenarios: Object.keys(SCENARIO_DATA),
  ...calculatePortfolioTotals()
}