/**
 * Products API
 * Handles all product-related API calls
 */

import { apiClient } from '@/lib/api/client';

export const productsApi = {
  async getProducts() {
    const response = await apiClient.get('/api/products');
    return response.data;
  },

  async getProduct(id: string) {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  async createProduct(data: any) {
    const response = await apiClient.post('/api/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: any) {
    const response = await apiClient.put(`/api/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },

  async uploadProductImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await apiClient.post(`/api/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProductImage(productId: string, imageUrl: string) {
    const response = await apiClient.delete(`/api/products/${productId}/images/${encodeURIComponent(imageUrl)}`);
    return response.data;
  },
};
