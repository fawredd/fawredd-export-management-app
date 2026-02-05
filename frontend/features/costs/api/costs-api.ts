/**
 * Costs API
 * Handles all cost-related API calls
 */

import { apiClient } from '@/lib/api/client';

export const costsApi = {
  async getCosts() {
    const response = await apiClient.get('/api/costs');
    return response.data;
  },

  async getCost(id: string) {
    const response = await apiClient.get(`/api/costs/${id}`);
    return response.data;
  },

  async createCost(data: any) {
    const response = await apiClient.post('/api/costs', data);
    return response.data;
  },

  async updateCost(id: string, data: any) {
    const response = await apiClient.put(`/api/costs/${id}`, data);
    return response.data;
  },

  async deleteCost(id: string) {
    const response = await apiClient.delete(`/api/costs/${id}`);
    return response.data;
  },
};
