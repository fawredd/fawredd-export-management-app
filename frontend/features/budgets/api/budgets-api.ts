/**
 * Budgets API
 * Handles all budget-related API calls
 */

import { apiClient } from '@/lib/api/client';

export const budgetsApi = {
  async getBudgets() {
    const response = await apiClient.get('/api/budgets');
    return response.data;
  },

  async getBudget(id: string) {
    const response = await apiClient.get(`/api/budgets/${id}`);
    return response.data;
  },

  async createBudget(data: any) {
    const response = await apiClient.post('/api/budgets', data);
    return response.data;
  },

  async updateBudgetStatus(id: string, status: string) {
    const response = await apiClient.patch(`/api/budgets/${id}/status`, { status });
    return response.data;
  },

  async deleteBudget(id: string) {
    const response = await apiClient.delete(`/api/budgets/${id}`);
    return response.data;
  },
};
