import api from './api';

export interface MarketDataResponse {
  message: string;
  updated_count: number;
  updated_stocks: {
    id: string;
    symbol: string;
    oldPrice: string;
    newPrice: string;
    change: string;
    changePercent: string;
    source: string;
    cached: boolean;
    ageHours: number;
  }[];
  market_data_sources: string[];
}

export const marketDataService = {
  // Update prices for all stocks in a portfolio
  async updatePortfolioPrices(portfolioId: string, forceRefresh: boolean = false): Promise<MarketDataResponse> {
    const forceParam = forceRefresh ? '&forceRefresh=true' : '';
    const response = await api.post(`/stocks/update-prices?portfolioId=${portfolioId}${forceParam}`, {});
    return response;
  },

  // Update prices for specific symbols
  async updateSymbolPrices(symbols: string[], forceRefresh: boolean = false): Promise<MarketDataResponse> {
    const symbolsParam = symbols.join(',');
    const forceParam = forceRefresh ? '&forceRefresh=true' : '';
    const response = await api.post(`/stocks/update-prices?symbols=${symbolsParam}${forceParam}`, {});
    return response;
  }
};