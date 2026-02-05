/**
 * Clients API
 * Handles all client-related API calls
 */

import { apiClient } from '@/lib/api/client';

export const clientsApi = {
  async getClients() {
    const response = await apiClient.get('/api/clients');
    return response.data;
  },

  async getClient(id: string) {
    const response = await apiClient.get(`/api/clients/${id}`);
    return response.data;
  },

  async createClient(data: any) {
    const response = await apiClient.post('/api/clients', data);
    return response.data;
  },

  async updateClient(id: string, data: any) {
    const response = await apiClient.put(`/api/clients/${id}`, data);
    return response.data;
  },

  async deleteClient(id: string) {
    const response = await apiClient.delete(`/api/clients/${id}`);
    return response.data;
  },
};
