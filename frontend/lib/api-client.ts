/**
 * API client for making requests to the backend
 */

import { User, Product, Provider, Client, Budget, Cost } from '../shared/types';
import axios, { AxiosInstance, AxiosError, HttpStatusCode } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name?: string }): Promise<{ user: User; token: string }> {
    const response: { data: { user: User; token: string } } = await this.client.post('/api/auth/register', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const response: { data: { user: User; token: string } } = await this.client.post('/api/auth/login', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async getCurrentUser() {
    const response: { data: User } = await this.client.get('/api/auth/me');
    return response.data;
  }

  logout() {
    this.clearToken();
  }

  // User management endpoints (Admin only)
  async getUsers() {
    const response: { data: User[] } = await this.client.get('/api/users');
    return response.data;
  }

  async getUser(id: string) {
    const response: { data: User } = await this.client.get(`/api/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response: { data: User } = await this.client.post('/api/users', data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response: { data: User } = await this.client.put(`/api/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/api/users/${id}`);
    return response.data;
  }

  // Product endpoints
  async getProducts() {
    const response: { data: Product[] } = await this.client.get('/api/products');
    return response.data;
  }

  async getProduct(id: string) {
    const response: { data: Product } = await this.client.get(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(data: any) {
    const response: { data: Product } = await this.client.post('/api/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: any) {
    const response: { data: Product } = await this.client.put(`/api/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string) {
    const response: { data: HttpStatusCode } = await this.client.delete(`/api/products/${id}`);
    return response.data;
  }

  async uploadProductImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await this.client.post(`/api/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProductImage(productId: string, imageUrl: string) {
    const response = await this.client.delete(`/api/products/${productId}/images/${encodeURIComponent(imageUrl)}`);
    return response.data;
  }

  // Provider endpoints
  async getProviders() {
    const response: { data: Provider[] } = await this.client.get('/api/providers');
    return response.data;
  }

  async getProvider(id: string) {
    const response: { data: Provider } = await this.client.get(`/api/providers/${id}`);
    return response.data;
  }

  async createProvider(data: any) {
    const response: { data: Provider } = await this.client.post('/api/providers', data);
    return response.data;
  }

  async updateProvider(id: string, data: any) {
    const response: { data: Provider } = await this.client.put(`/api/providers/${id}`, data);
    return response.data;
  }

  async deleteProvider(id: string) {
    const response: { data: HttpStatusCode } = await this.client.delete(`/api/providers/${id}`);
    return response.data;
  }

  // Client endpoints
  async getClients() {
    const response: { data: Client[] } = await this.client.get('/api/clients');
    return response.data;
  }

  async getClient(id: string) {
    const response: { data: Client } = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  async createClient(data: any) {
    const response: { data: Client } = await this.client.post('/api/clients', data);
    return response.data;
  }

  async updateClient(id: string, data: any) {
    const response: { data: Client } = await this.client.put(`/api/clients/${id}`, data);
    return response.data;
  }

  async deleteClient(id: string) {
    const response: { data: HttpStatusCode } = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  // Budget endpoints
  async getBudgets() {
    const response: { data: Budget[] } = await this.client.get('/api/budgets');
    return response.data;
  }

  async getBudget(id: string) {
    const response: { data: Budget } = await this.client.get(`/api/budgets/${id}`);
    return response.data;
  }

  async createBudget(data: any) {
    const response: { data: Budget } = await this.client.post('/api/budgets', data);
    return response.data;
  }

  async updateBudgetStatus(id: string, status: string) {
    const response: { data: Budget } = await this.client.patch(`/api/budgets/${id}/status`, { status });
    return response.data;
  }

  async deleteBudget(id: string) {
    const response: { data: HttpStatusCode } = await this.client.delete(`/api/budgets/${id}`);
    return response.data;
  }

  // Cost endpoints
  async getCosts() {
    const response: { data: Cost[] } = await this.client.get('/api/costs');
    return response.data;
  }

  async getCost(id: string) {
    const response: { data: Cost } = await this.client.get(`/api/costs/${id}`);
    return response.data;
  }

  async createCost(data: any) {
    const response: { data: Cost } = await this.client.post('/api/costs', data);
    return response.data;
  }

  async updateCost(id: string, data: any) {
    const response: { data: Cost } = await this.client.put(`/api/costs/${id}`, data);
    return response.data;
  }

  async deleteCost(id: string) {
    const response: { data: HttpStatusCode } = await this.client.delete(`/api/costs/${id}`);
    return response.data;
  }

  // Tariff Position endpoints
  async getTariffPositions(params?: { page?: number; limit?: number; search?: string }) {
    const response = await this.client.get('/api/tariff-positions', { params });
    return response.data;
  }

  async getTariffPosition(id: string) {
    const response = await this.client.get(`/api/tariff-positions/${id}`);
    return response.data;
  }

  async createTariffPosition(data: any) {
    const response = await this.client.post('/api/tariff-positions', data);
    return response.data;
  }

  async updateTariffPosition(id: string, data: any) {
    const response = await this.client.put(`/api/tariff-positions/${id}`, data);
    return response.data;
  }

  async deleteTariffPosition(id: string) {
    const response = await this.client.delete(`/api/tariff-positions/${id}`);
    return response.data;
  }

  // Unit of Measure endpoints
  async getUnits() {
    const response = await this.client.get('/api/units');
    return response.data;
  }

  async getUnit(id: string) {
    const response = await this.client.get(`/api/units/${id}`);
    return response.data;
  }

  async createUnit(data: any) {
    const response = await this.client.post('/api/units', data);
    return response.data;
  }

  async updateUnit(id: string, data: any) {
    const response = await this.client.put(`/api/units/${id}`, data);
    return response.data;
  }

  async deleteUnit(id: string) {
    const response = await this.client.delete(`/api/units/${id}`);
    return response.data;
  }

  // Country endpoints
  async getCountries() {
    const response = await this.client.get('/api/countries');
    return response.data;
  }

  async getCountry(id: string) {
    const response = await this.client.get(`/api/countries/${id}`);
    return response.data;
  }

  async createCountry(data: any) {
    const response = await this.client.post('/api/countries', data);
    return response.data;
  }

  async updateCountry(id: string, data: any) {
    const response = await this.client.put(`/api/countries/${id}`, data);
    return response.data;
  }

  async deleteCountry(id: string) {
    const response = await this.client.delete(`/api/countries/${id}`);
    return response.data;
  }

  // Export Task endpoints
  async getExportTasks(params?: { page?: number; limit?: number; countryId?: string; status?: string }) {
    const response = await this.client.get('/api/export-tasks', { params });
    return response.data;
  }

  async getExportTask(id: string) {
    const response = await this.client.get(`/api/export-tasks/${id}`);
    return response.data;
  }

  async createExportTask(data: any) {
    const response = await this.client.post('/api/export-tasks', data);
    return response.data;
  }

  async updateExportTask(id: string, data: any) {
    const response = await this.client.put(`/api/export-tasks/${id}`, data);
    return response.data;
  }

  async updateExportTaskStatus(id: string, status: string, completedAt?: string) {
    const response = await this.client.patch(`/api/export-tasks/${id}/status`, { status, completedAt });
    return response.data;
  }

  async deleteExportTask(id: string) {
    const response = await this.client.delete(`/api/export-tasks/${id}`);
    return response.data;
  }

  // Tax endpoints
  async getTaxes() {
    const response = await this.client.get('/api/taxes');
    return response.data;
  }

  async getTaxesByProduct(productId: string) {
    const response = await this.client.get(`/api/taxes/product/${productId}`);
    return response.data;
  }

  async getTax(id: string) {
    const response = await this.client.get(`/api/taxes/${id}`);
    return response.data;
  }

  async createTax(data: any) {
    const response = await this.client.post('/api/taxes', data);
    return response.data;
  }

  async updateTax(id: string, data: any) {
    const response = await this.client.put(`/api/taxes/${id}`, data);
    return response.data;
  }

  async deleteTax(id: string) {
    const response = await this.client.delete(`/api/taxes/${id}`);
    return response.data;
  }

  // Price History endpoints
  async getPriceHistoryByProduct(productId: string, type?: string) {
    const response = await this.client.get(`/api/price-history/product/${productId}`, { params: { type } });
    return response.data;
  }

  async createPriceHistory(data: any) {
    const response = await this.client.post('/api/price-history', data);
    return response.data;
  }

  async deletePriceHistory(id: string) {
    const response = await this.client.delete(`/api/price-history/${id}`);
    return response.data;
  }

  // Invoice endpoints
  async getInvoices(params?: { page?: number; limit?: number; budgetId?: string }) {
    const response = await this.client.get('/api/invoices', { params });
    return response.data;
  }

  async getInvoice(id: string) {
    const response = await this.client.get(`/api/invoices/${id}`);
    return response.data;
  }

  async createInvoice(data: any) {
    const response = await this.client.post('/api/invoices', data);
    return response.data;
  }

  async updateInvoice(id: string, data: any) {
    const response = await this.client.put(`/api/invoices/${id}`, data);
    return response.data;
  }

  async generateInvoicePdf(id: string) {
    const response = await this.client.post(`/api/invoices/${id}/generate-pdf`);
    return response.data;
  }

  async deleteInvoice(id: string) {
    const response = await this.client.delete(`/api/invoices/${id}`);
    return response.data;
  }

  // Packing List endpoints
  async getPackingLists(params?: { page?: number; limit?: number; budgetId?: string }) {
    const response = await this.client.get('/api/packing-lists', { params });
    return response.data;
  }

  async getPackingList(id: string) {
    const response = await this.client.get(`/api/packing-lists/${id}`);
    return response.data;
  }

  async createPackingList(data: any) {
    const response = await this.client.post('/api/packing-lists', data);
    return response.data;
  }

  async autoGeneratePackingList(budgetId: string) {
    const response = await this.client.post('/api/packing-lists/auto-generate', { budgetId });
    return response.data;
  }

  async updatePackingList(id: string, data: any) {
    const response = await this.client.put(`/api/packing-lists/${id}`, data);
    return response.data;
  }

  async generatePackingListPdf(id: string) {
    const response = await this.client.post(`/api/packing-lists/${id}/generate-pdf`);
    return response.data;
  }

  async deletePackingList(id: string) {
    const response = await this.client.delete(`/api/packing-lists/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
