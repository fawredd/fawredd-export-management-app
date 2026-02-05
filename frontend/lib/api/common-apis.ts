/**
 * Common API modules for simpler features
 */

import { apiClient } from '@/lib/api/client';

// Invoices API
export const invoicesApi = {
  async getInvoices(params?: any) {
    const response = await apiClient.get('/api/invoices', { params });
    return response.data;
  },
  async getInvoice(id: string) {
    const response = await apiClient.get(`/api/invoices/${id}`);
    return response.data;
  },
  async createInvoice(data: any) {
    const response = await apiClient.post('/api/invoices', data);
    return response.data;
  },
  async updateInvoice(id: string, data: any) {
    const response = await apiClient.put(`/api/invoices/${id}`, data);
    return response.data;
  },
  async deleteInvoice(id: string) {
    const response = await apiClient.delete(`/api/invoices/${id}`);
    return response.data;
  },
  async generateInvoicePdf(id: string) {
    const response = await apiClient.post(`/api/invoices/${id}/generate-pdf`);
    return response.data;
  },
};

// Packing Lists API
export const packingListsApi = {
  async getPackingLists(params?: any) {
    const response = await apiClient.get('/api/packing-lists', { params });
    return response.data;
  },
  async getPackingList(id: string) {
    const response = await apiClient.get(`/api/packing-lists/${id}`);
    return response.data;
  },
  async createPackingList(data: any) {
    const response = await apiClient.post('/api/packing-lists', data);
    return response.data;
  },
  async autoGeneratePackingList(budgetId: string) {
    const response = await apiClient.post('/api/packing-lists/auto-generate', { budgetId });
    return response.data;
  },
  async updatePackingList(id: string, data: any) {
    const response = await apiClient.put(`/api/packing-lists/${id}`, data);
    return response.data;
  },
  async deletePackingList(id: string) {
    const response = await apiClient.delete(`/api/packing-lists/${id}`);
    return response.data;
  },
  async generatePackingListPdf(id: string) {
    const response = await apiClient.post(`/api/packing-lists/${id}/generate-pdf`);
    return response.data;
  },
};

// Export Tasks API
export const exportTasksApi = {
  async getExportTasks(params?: any) {
    const response = await apiClient.get('/api/export-tasks', { params });
    return response.data;
  },
  async getExportTask(id: string) {
    const response = await apiClient.get(`/api/export-tasks/${id}`);
    return response.data;
  },
  async createExportTask(data: any) {
    const response = await apiClient.post('/api/export-tasks', data);
    return response.data;
  },
  async updateExportTask(id: string, data: any) {
    const response = await apiClient.put(`/api/export-tasks/${id}`, data);
    return response.data;
  },
  async updateExportTaskStatus(id: string, status: string, completedAt?: string) {
    const response = await apiClient.patch(`/api/export-tasks/${id}/status`, { status, completedAt });
    return response.data;
  },
  async deleteExportTask(id: string) {
    const response = await apiClient.delete(`/api/export-tasks/${id}`);
    return response.data;
  },
};

// Tariff Positions API
export const tariffPositionsApi = {
  async getTariffPositions(params?: any) {
    const response = await apiClient.get('/api/tariff-positions', { params });
    return response.data;
  },
  async getTariffPosition(id: string) {
    const response = await apiClient.get(`/api/tariff-positions/${id}`);
    return response.data;
  },
  async createTariffPosition(data: any) {
    const response = await apiClient.post('/api/tariff-positions', data);
    return response.data;
  },
  async updateTariffPosition(id: string, data: any) {
    const response = await apiClient.put(`/api/tariff-positions/${id}`, data);
    return response.data;
  },
  async deleteTariffPosition(id: string) {
    const response = await apiClient.delete(`/api/tariff-positions/${id}`);
    return response.data;
  },
};

// Units API
export const unitsApi = {
  async getUnits() {
    const response = await apiClient.get('/api/units');
    return response.data;
  },
  async getUnit(id: string) {
    const response = await apiClient.get(`/api/units/${id}`);
    return response.data;
  },
  async createUnit(data: any) {
    const response = await apiClient.post('/api/units', data);
    return response.data;
  },
  async updateUnit(id: string, data: any) {
    const response = await apiClient.put(`/api/units/${id}`, data);
    return response.data;
  },
  async deleteUnit(id: string) {
    const response = await apiClient.delete(`/api/units/${id}`);
    return response.data;
  },
};

// Countries API
export const countriesApi = {
  async getCountries() {
    const response = await apiClient.get('/api/countries');
    return response.data;
  },
  async getCountry(id: string) {
    const response = await apiClient.get(`/api/countries/${id}`);
    return response.data;
  },
  async createCountry(data: any) {
    const response = await apiClient.post('/api/countries', data);
    return response.data;
  },
  async updateCountry(id: string, data: any) {
    const response = await apiClient.put(`/api/countries/${id}`, data);
    return response.data;
  },
  async deleteCountry(id: string) {
    const response = await apiClient.delete(`/api/countries/${id}`);
    return response.data;
  },
};
