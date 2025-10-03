import { supabase } from '@/lib/supabaseClient';
import { ApiResponse } from '@/lib/validation';
import type { Client, Case, Document, BillingEntry, Billing } from '@/types/supabase';

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

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
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
  getAll: () => apiClient.get<Client[]>('/clients'),
  create: (data: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => apiClient.post<Client>('/clients', data),
  update: (id: string, data: Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => apiClient.put<Client>('/clients', { id, ...data }),
  delete: (id: string) => apiClient.delete<Client>('/clients', id),
};

export const casesApi = {
  getAll: () => apiClient.get<Case[]>('/cases'),
  create: (data: Omit<Case, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => apiClient.post<Case>('/cases', data),
  update: (id: string, data: Partial<Omit<Case, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => apiClient.put<Case>('/cases', { id, ...data }),
  delete: (id: string) => apiClient.delete<Case>('/cases', id),
};

export const documentsApi = {
  getAll: () => apiClient.get<Document[]>('/documents'),
  create: (data: Omit<Document, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'uploaded_at'>) => apiClient.post<Document>('/documents', data),
  update: (id: string, data: Partial<Omit<Document, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'uploaded_at'>>) => apiClient.put<Document>('/documents', { id, ...data }),
  delete: (id: string) => apiClient.delete<Document>('/documents', id),
};

export const billingApi = {
  getAll: () => apiClient.get<Billing[]>('/billing'),
  create: (data: Omit<Billing, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => apiClient.post<Billing>('/billing', data),
  update: (id: string, data: Partial<Omit<Billing, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => apiClient.put<Billing>('/billing', { id, ...data }),
  delete: (id: string) => apiClient.delete<Billing>('/billing', id),
};

export const billingEntriesApi = {
  getAll: () => apiClient.get<BillingEntry[]>('/billing-entries'),
  create: (data: Omit<BillingEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => apiClient.post<BillingEntry>('/billing-entries', data),
  update: (id: string, data: Partial<Omit<BillingEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => apiClient.put<BillingEntry>('/billing-entries', { id, ...data }),
  delete: (id: string) => apiClient.delete<BillingEntry>('/billing-entries', id),
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
