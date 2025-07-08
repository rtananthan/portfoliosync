import { ETF, CreateETFRequest } from '../types';
import api from './api';

export const etfService = {
  async getETFs(portfolioId: string): Promise<ETF[]> {
    const response = await api.get(`/portfolios/${portfolioId}/etfs`);
    return response?.etfs || [];
  },

  async createETF(portfolioId: string, etf: CreateETFRequest): Promise<ETF> {
    const response = await api.post(`/portfolios/${portfolioId}/etfs`, etf);
    return response.etf || response;
  },

  async updateETF(etfId: string, updates: Partial<CreateETFRequest>): Promise<ETF> {
    const response = await api.put(`/etfs/${etfId}`, updates);
    return response.etf || response;
  },

  async deleteETF(etfId: string): Promise<void> {
    return api.delete(`/etfs/${etfId}`);
  },

  async refreshETFPrice(etfId: string, forceRefresh: boolean = false): Promise<ETF> {
    const response = await api.put(`/etfs/${etfId}`, {
      forceRefresh,
      refreshPrice: true,
    });
    return response.etf || response;
  },
};