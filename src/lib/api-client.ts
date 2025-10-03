import { supabase } from '@/lib/supabaseClient';
import { ApiResponse } from '@/lib/validation';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }
  return session.access_token;
}

// Generic API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`${endpoint}?id=${id}`, {
      method: 'DELETE',
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient('/api');

// Specific API functions for each resource
export const clientsApi = {
  getAll: () => apiClient.get('/clients'),
  create: (data: any) => apiClient.post('/clients', data),
  update: (id: string, data: any) => apiClient.put('/clients', { id, ...data }),
  delete: (id: string) => apiClient.delete('/clients', id),
};

export const casesApi = {
  getAll: () => apiClient.get('/cases'),
  create: (data: any) => apiClient.post('/cases', data),
  update: (id: string, data: any) => apiClient.put('/cases', { id, ...data }),
  delete: (id: string) => apiClient.delete('/cases', id),
};

export const documentsApi = {
  getAll: () => apiClient.get('/documents'),
  create: (data: any) => apiClient.post('/documents', data),
  update: (id: string, data: any) => apiClient.put('/documents', { id, ...data }),
  delete: (id: string) => apiClient.delete('/documents', id),
};

export const billingApi = {
  getAll: () => apiClient.get('/billing'),
  create: (data: any) => apiClient.post('/billing', data),
  update: (id: string, data: any) => apiClient.put('/billing', { id, ...data }),
  delete: (id: string) => apiClient.delete('/billing', id),
};

export const billingEntriesApi = {
  getAll: () => apiClient.get('/billing-entries'),
  create: (data: any) => apiClient.post('/billing-entries', data),
  update: (id: string, data: any) => apiClient.put('/billing-entries', { id, ...data }),
  delete: (id: string) => apiClient.delete('/billing-entries', id),
};

// Helper function to handle API errors with toast notifications
export function handleApiError(error: unknown, showToast: (message: string, type: 'success' | 'error') => void): string {
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  showToast(errorMessage, 'error');
  return errorMessage;
}

// Helper function to handle successful API responses
export function handleApiSuccess<T>(
  response: ApiResponse<T>,
  showToast: (message: string, type: 'success' | 'error') => void,
  successMessage: string = 'Operation completed successfully'
): T {
  if (response.success && response.data) {
    showToast(successMessage, 'success');
    return response.data;
  } else {
    throw new Error(response.error || 'Operation failed');
  }
}
