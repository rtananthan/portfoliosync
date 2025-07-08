import { ETF, CreateETFRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jhjtsrmah8.execute-api.ap-southeast-2.amazonaws.com';

export const etfService = {
  async getETFs(portfolioId: string): Promise<ETF[]> {
    const response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/etfs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ETFs');
    }

    const data = await response.json();
    return data?.etfs || [];
  },

  async createETF(portfolioId: string, etf: CreateETFRequest): Promise<ETF> {
    const response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/etfs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(etf),
    });

    if (!response.ok) {
      throw new Error('Failed to create ETF');
    }

    const data = await response.json();
    return data.etf;
  },

  async updateETF(etfId: string, updates: Partial<CreateETFRequest>): Promise<ETF> {
    const response = await fetch(`${API_BASE_URL}/etfs/${etfId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update ETF');
    }

    const data = await response.json();
    return data.etf;
  },

  async deleteETF(etfId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/etfs/${etfId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete ETF');
    }
  },

  async refreshETFPrice(etfId: string, forceRefresh: boolean = false): Promise<ETF> {
    const response = await fetch(`${API_BASE_URL}/etfs/${etfId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        forceRefresh,
        refreshPrice: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh ETF price');
    }

    const data = await response.json();
    return data.etf;
  },
};