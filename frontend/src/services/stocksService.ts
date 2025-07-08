import api from './api';
import { Stock, CreateStockRequest } from '../types';

// Portfolio service functions
export const portfolioService = {
  // Create a portfolio first (needed for stocks)
  async createPortfolio(name: string) {
    return api.post('/portfolios', { name });
  },

  // Get all portfolios
  async getPortfolios() {
    return api.get('/portfolios');
  }
};

// Stock service functions
export const stocksService = {
  // Get stocks for a portfolio
  async getStocks(portfolioId: string): Promise<Stock[]> {
    const response = await api.get(`/portfolios/${portfolioId}/stocks`);
    // API returns { stocks: [...], portfolioId: "...", count: 0 }
    return response?.stocks || [];
  },

  // Add a new stock to a portfolio
  async addStock(portfolioId: string, stockData: CreateStockRequest): Promise<Stock> {
    const response = await api.post(`/portfolios/${portfolioId}/stocks`, stockData);
    return response.stock || response; // Handle response format
  },

  // Update a stock
  async updateStock(stockId: string, stockData: Partial<CreateStockRequest>): Promise<Stock> {
    const response = await api.put(`/stocks/${stockId}`, stockData);
    return response.stock || response; // Handle response format
  },

  // Delete a stock
  async deleteStock(stockId: string): Promise<void> {
    return api.delete(`/stocks/${stockId}`);
  }
};

// For development - create a default portfolio if none exists
export async function ensureDefaultPortfolio() {
  try {
    const response = await portfolioService.getPortfolios();
    const portfolios = response.portfolios || response; // Handle both response formats
    
    if (!portfolios || portfolios.length === 0) {
      console.log('No portfolios found, creating default portfolio...');
      const portfolioResponse = await portfolioService.createPortfolio('My Portfolio');
      return portfolioResponse.portfolio?.id || portfolioResponse.id;
    }
    
    return portfolios[0].id;
  } catch (error) {
    console.error('Error ensuring default portfolio:', error);
    // Create a default portfolio if API call fails
    try {
      const portfolioResponse = await portfolioService.createPortfolio('My Portfolio');
      return portfolioResponse.portfolio?.id || portfolioResponse.id;
    } catch (createError) {
      console.error('Error creating default portfolio:', createError);
      throw createError;
    }
  }
}