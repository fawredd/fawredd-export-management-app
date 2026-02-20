/**
 * Base API client configuration
 * Provides configured axios instance for all feature API modules
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  // If URL is empty, strictly "/api", or matches origin, we want relative paths starting with /api
  // Since methods already include /api, we use an empty baseURL
  if (!url || url === '/api' || url.startsWith('/')) {
    return '';
  }
  return url;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
