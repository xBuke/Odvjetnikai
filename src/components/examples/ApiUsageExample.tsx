'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { clientsApi, casesApi, documentsApi, billingApi, handleApiError, handleApiSuccess } from '@/lib/api-client';

/**
 * Example component demonstrating how to use the new API routes
 * This shows the improved error handling and validation
 */
export default function ApiUsageExample() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Example: Create a new client
  const createClient = async () => {
    try {
      setLoading(true);
      
      const response = await clientsApi.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        oib: '12345678901',
        notes: 'Test client'
      });

      const newClient = handleApiSuccess(response, showToast, 'Client created successfully');
      console.log('New client:', newClient);
      
    } catch (error) {
      handleApiError(error, showToast);
    } finally {
      setLoading(false);
    }
  };

  // Example: Get all clients
  const getClients = async () => {
    try {
      setLoading(true);
      
      const response = await clientsApi.getAll();
      const clients = handleApiSuccess(response, showToast, 'Clients loaded successfully');
      console.log('Clients:', clients);
      
    } catch (error) {
      handleApiError(error, showToast);
    } finally {
      setLoading(false);
    }
  };

  // Example: Update a client
  const updateClient = async (clientId: string) => {
    try {
      setLoading(true);
      
      const response = await clientsApi.update(clientId, {
        name: 'John Smith',
        notes: 'Updated notes'
      });

      const updatedClient = handleApiSuccess(response, showToast, 'Client updated successfully');
      console.log('Updated client:', updatedClient);
      
    } catch (error) {
      handleApiError(error, showToast);
    } finally {
      setLoading(false);
    }
  };

  // Example: Delete a client
  const deleteClient = async (clientId: string) => {
    try {
      setLoading(true);
      
      const response = await clientsApi.delete(clientId);
      handleApiSuccess(response, showToast, 'Client deleted successfully');
      
    } catch (error) {
      handleApiError(error, showToast);
    } finally {
      setLoading(false);
    }
  };

  // Example: Create a case
  const createCase = async () => {
    try {
      setLoading(true);
      
      const response = await casesApi.create({
        title: 'Test Case',
        client_id: 'client-uuid-here',
        status: 'Open',
        notes: 'Test case notes'
      });

      const newCase = handleApiSuccess(response, showToast, 'Case created successfully');
      console.log('New case:', newCase);
      
    } catch (error) {
      handleApiError(error, showToast);
    } finally {
      setLoading(false);
    }
  };

  // Example: Create a billing entry
  const createBillingEntry = async () => {
    try {
      setLoading(true);
      
      const response = await billingApi.create({
        client_id: 'client-uuid-here',
        case_id: 'case-uuid-here',
        amount: 150.00,
        description: 'Legal consultation',
        status: 'pending'
      });

      const newBilling = handleApiSuccess(response, showToast, 'Billing entry created successfully');
      console.log('New billing entry:', newBilling);
      
    } catch (error) {
      handleApiError(error, showToast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">API Usage Examples</h2>
      <p className="text-muted-foreground">
        These examples demonstrate how to use the new API routes with proper error handling and validation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Clients API</h3>
          <button 
            onClick={createClient}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Create Client
          </button>
          <button 
            onClick={getClients}
            disabled={loading}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Get All Clients
          </button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Cases API</h3>
          <button 
            onClick={createCase}
            disabled={loading}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Create Case
          </button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Billing API</h3>
          <button 
            onClick={createBillingEntry}
            disabled={loading}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Create Billing Entry
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      )}
    </div>
  );
}
