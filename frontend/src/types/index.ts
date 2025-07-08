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
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  address: string;
  type: 'residential' | 'commercial' | 'land';
  purchasePrice: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  purchaseDate: string;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
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
  quantity: number;
  averagePrice: number;
}

export interface CreatePropertyRequest {
  address: string;
  type: 'residential' | 'commercial' | 'land';
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
}