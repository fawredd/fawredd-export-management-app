/**
 * Providers API
 * Handles all provider-related API calls
 */

import { apiClient } from '@/lib/api/client';

export const providersApi = {
  async getProviders() {
    const response = await apiClient.get('/api/providers');
    return response.data;
  },

  async getProvider(id: string) {
    const response = await apiClient.get(`/api/providers/${id}`);
    return response.data;
  },

  async createProvider(data: any) {
    const response = await apiClient.post('/api/providers', data);
    return response.data;
  },

  async updateProvider(id: string, data: any) {
    const response = await apiClient.put(`/api/providers/${id}`, data);
    return response.data;
  },

  async deleteProvider(id: string) {
    const response = await apiClient.delete(`/api/providers/${id}`);
    return response.data;
  },
};
