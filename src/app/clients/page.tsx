'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormTextarea, FormActions } from '../../components/ui/Form';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  selectWithUserId, 
  insertAndReturnWithUserId, 
  updateWithUserId, 
  deleteWithUserId 
} from '@/lib/supabaseHelpers';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  oib: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { session } = useAuth();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
    // Fallback function if context is not available
    t = (key: string) => key;
  }
  
  // State management
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    oib: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Load clients from Supabase
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await selectWithUserId(supabase, 'clients');
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load clients. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.oib.includes(searchTerm)
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);


      // Validate form data
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.oib.trim()) {
        throw new Error('Please fill in all required fields.');
      }

      if (formData.oib.length !== 11) {
        throw new Error('OIB must be exactly 11 digits.');
      }

      if (editingClient) {
        // Update existing client
        const data = await updateWithUserId(
          supabase, 
          'clients', 
          'id', 
          editingClient.id, 
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            oib: formData.oib,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          }
        );

        if (!data || data.length === 0) {
          throw new Error('Klijent nije pronađen');
        }

        console.log('Client updated successfully:', data);
        showToast('✔ Klijent uspješno ažuriran', 'success');
      } else {
        // Add new client
        const data = await insertAndReturnWithUserId(supabase, 'clients', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          oib: formData.oib,
          notes: formData.notes
        });

        console.log('Client created successfully:', data);
        showToast('✔ Klijent uspješno dodan', 'success');
      }

      // Reload clients and reset form (only for updates)
      await loadClients();
      setFormData({ name: '', email: '', phone: '', oib: '', notes: '' });
      setEditingClient(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving client:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      const errorMessage = err instanceof Error ? err.message : 'Greška pri spremanju klijenta. Molimo pokušajte ponovno.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri spremanju", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      oib: client.oib,
      notes: client.notes
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (clientId: string) => {
    if (confirm(t('clients.deleteConfirm'))) {
      try {
        setError(null);
        
        const data = await deleteWithUserId(supabase, 'clients', 'id', clientId);

        if (!data || data.length === 0) {
          throw new Error('Klijent nije pronađen');
        }

        console.log('Client deleted successfully:', data);
        showToast('✔ Klijent uspješno obrisan', 'success');
        // Reload clients after deletion
        await loadClients();
      } catch (err) {
        console.error('Error deleting client:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        const errorMessage = err instanceof Error ? err.message : 'Greška pri brisanju klijenta. Molimo pokušajte ponovno.';
        setError(errorMessage);
        showToast(errorMessage ?? "Greška pri spremanju", 'error');
      }
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', oib: '', notes: '' });
  };

  // Handle row click to navigate to client detail
  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('clients.title')}</h2>
            <p className="text-muted-foreground text-sm sm:text-base">{t('clients.subtitle')}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>{t('clients.addClient')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder={t('clients.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">{t('clients.loadingClients')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.name')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      {t('clients.email')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      {t('clients.phone')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      {t('clients.oib')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      {t('clients.notes')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredClients.map((client, index) => (
                    <tr 
                      key={client.id} 
                      className={`hover:bg-accent cursor-pointer transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                      }`}
                      onClick={() => handleRowClick(client.id)}
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-sm font-medium text-foreground">{client.name}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          {client.email}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground hidden lg:table-cell">
                        {client.oib}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-muted-foreground max-w-xs truncate hidden lg:table-cell">
                        {client.notes}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div 
                          className="flex items-center space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEdit(client)}
                            className="text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors duration-200"
                            title="Edit client"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10 transition-colors duration-200"
                            title="Delete client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClients.length === 0 && !loading && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">{t('clients.noClientsFound')}</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? t('clients.tryAdjusting') : t('clients.getStarted')}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingClient ? t('clients.editClient') : t('clients.addNewClient')}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t('clients.name')} required>
            <FormInput
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('clients.enterName')}
              required
            />
          </FormField>

          <FormField label={t('clients.email')} required>
            <FormInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('clients.enterEmail')}
              required
            />
          </FormField>

          <FormField label={t('clients.phone')} required>
            <FormInput
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t('clients.enterPhone')}
              required
            />
          </FormField>

          <FormField label={t('clients.oib')} required>
            <FormInput
              name="oib"
              value={formData.oib}
              onChange={handleInputChange}
              maxLength={11}
              placeholder={t('clients.enterOIB')}
              required
            />
          </FormField>

          <FormField label={t('clients.notes')}>
            <FormTextarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder={t('clients.enterNotes')}
            />
          </FormField>

          <FormActions
            onCancel={handleModalClose}
            onSubmit={() => {}}
            submitText={editingClient ? t('clients.updateClient') : t('clients.addClient')}
            isLoading={submitting}
          />
        </form>
      </Modal>
    </div>
  );
}
