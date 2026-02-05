/**
 * Admin/Users API
 */

import { apiClient } from '@/lib/api/client';

export const usersApi = {
  async getUsers() {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  async getUser(id: string) {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  async createUser(data: any) {
    const response = await apiClient.post('/api/users', data);
    return response.data;
  },

  async updateUser(id: string, data: any) {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};
