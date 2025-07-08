import { Property, CreatePropertyRequest } from '../types';
import api from './api';

export const propertyService = {
  async getProperties(portfolioId: string): Promise<Property[]> {
    const response = await api.get(`/portfolios/${portfolioId}/properties`);
    return response?.properties || [];
  },

  async createProperty(portfolioId: string, property: CreatePropertyRequest): Promise<Property> {
    const response = await api.post(`/portfolios/${portfolioId}/properties`, property);
    return response.property || response;
  },

  async updateProperty(propertyId: string, updates: Partial<CreatePropertyRequest>): Promise<Property> {
    const response = await api.put(`/properties/${propertyId}`, updates);
    return response.property || response;
  },

  async deleteProperty(propertyId: string): Promise<void> {
    return api.delete(`/properties/${propertyId}`);
  },
};