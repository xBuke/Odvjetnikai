'use client';

import { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormTextarea, FormActions } from '../../components/ui/Form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { clientsApi, handleApiError, handleApiSuccess } from '@/lib/api-client';
import { useUserPreferences, SortDirection } from '@/lib/userPreferences';
import TrialBanner from '@/components/billing/TrialBanner';
import { canCreateEntity } from '@/lib/ui-limit';
import type { Client } from '@/types/supabase';

// Use generated types from Supabase

// TypeScript interfaces for sorting
type ClientsSortField = 'name' | 'email' | 'phone' | 'created_at' | 'updated_at';

export default function ClientsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useAuth();
  
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

  // Sorting state with Supabase persistence
  const [sortField, setSortField] = useState<ClientsSortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Use shared user preferences utility
  const { loadPreferences, savePreferences } = useUserPreferences('clients', showToast);


  // Load user preferences from Supabase
  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = await loadPreferences();
      setSortField(preferences.sortField as ClientsSortField);
      setSortDirection(preferences.sortDirection);
    } catch (err) {
      console.error('Error loading user preferences:', err);
    } finally {
      setPreferencesLoaded(true);
    }
  }, [loadPreferences]);

  // Load clients from API with sorting
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new API client
      const response = await clientsApi.getAll();
      const data = handleApiSuccess<Client[]>(response, showToast, 'Clients loaded successfully');
      
      // Apply client-side sorting since API doesn't support it yet
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      setClients(sortedData);
    } catch (err) {
      console.error('Error loading clients:', err);
      const errorMessage = handleApiError(err, showToast);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection, showToast]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      // First load user preferences, then load clients
      await loadUserPreferences();
      await loadClients();
    };
    loadData();
  }, [loadClients, loadUserPreferences]);

  // Load clients when preferences are loaded and sorting changes
  useEffect(() => {
    if (preferencesLoaded) {
      loadClients();
    }
  }, [preferencesLoaded, sortField, sortDirection, loadClients]);

  // Handle sorting
  const handleSort = async (field: ClientsSortField) => {
    let newField = field;
    let newDirection: SortDirection;

    if (sortField === field) {
      // Toggle direction if same field
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field with default direction
      newField = field;
      newDirection = 'asc';
    }

    // Update state
    setSortField(newField);
    setSortDirection(newDirection);

    // Save preferences to Supabase
    await savePreferences(newField, newDirection);
  };

  // Get sort icon for column headers
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-primary" /> : 
      <ArrowDown className="w-4 h-4 text-primary" />;
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.oib.includes(searchTerm)
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

      // Check trial limits for new clients
      if (!editingClient && profile) {
        const limitCheck = canCreateEntity(profile, clients.length);
        if (!limitCheck.ok) {
          showToast(limitCheck.reason || 'Greška pri kreiranju klijenta', 'error');
          setSubmitting(false);
          return;
        }
      }

      // Validate form data
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.oib.trim()) {
        throw new Error('Please fill in all required fields.');
      }

      if (formData.oib.length !== 11) {
        throw new Error('OIB must be exactly 11 digits.');
      }

      if (editingClient) {
        // Update existing client using API
        const response = await clientsApi.update(editingClient.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          oib: formData.oib,
          notes: formData.notes
        });

        handleApiSuccess(response, showToast, '✔ Klijent uspješno ažuriran');
        
        // Auto-close modal and reset form after successful update
        await loadClients();
        setFormData({ name: '', email: '', phone: '', oib: '', notes: '' });
        setEditingClient(null);
        setIsModalOpen(false);
        return; // Exit early to prevent duplicate form reset
      } else {
        // Add new client using API
        const response = await clientsApi.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          oib: formData.oib,
          notes: formData.notes
        });

        handleApiSuccess(response, showToast, '✔ Klijent uspješno dodan');
      }

      // Reload clients and reset form (only for new clients)
      await loadClients();
      setFormData({ name: '', email: '', phone: '', oib: '', notes: '' });
      setEditingClient(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving client:', err);
      const errorMessage = handleApiError(err, showToast);
      setError(errorMessage);
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
      notes: client.notes || ''
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (clientId: string) => {
    if (confirm(t('clients.deleteConfirm'))) {
      try {
        setError(null);
        
        // Use the new API client
        const response = await clientsApi.delete(clientId);
        handleApiSuccess(response, showToast, '✔ Klijent uspješno obrisan');
        
        // Reload clients after deletion
        await loadClients();
      } catch (err) {
        console.error('Error deleting client:', err);
        const errorMessage = handleApiError(err, showToast);
        setError(errorMessage);
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
      {/* Trial Banner */}
      {profile && <TrialBanner profile={profile} />}
      
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

      {/* Sort Controls */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-foreground">
              Sort by:
            </label>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={async (e) => {
                const [field, direction] = e.target.value.split('-');
                const newField = field as ClientsSortField;
                const newDirection = direction as SortDirection;
                setSortField(newField);
                setSortDirection(newDirection);
                await savePreferences(newField, newDirection);
              }}
              className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="created_at-desc">Datum kreiranja (najnoviji)</option>
              <option value="created_at-asc">Datum kreiranja (najstariji)</option>
              <option value="updated_at-desc">Datum ažuriranja (najnoviji)</option>
              <option value="updated_at-asc">Datum ažuriranja (najstariji)</option>
              <option value="name-asc">Ime (A-Z)</option>
              <option value="name-desc">Ime (Z-A)</option>
              <option value="email-asc">Email (A-Z)</option>
              <option value="email-desc">Email (Z-A)</option>
              <option value="phone-asc">Telefon (A-Z)</option>
              <option value="phone-desc">Telefon (Z-A)</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            {clients.length} klijenata
            {profile && profile.subscription_status === 'trial' && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                ({clients.length}/20 iskorišteno tijekom triala)
              </span>
            )}
          </div>
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
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('clients.name')}</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('clients.email')}</span>
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('clients.phone')}</span>
                        {getSortIcon('phone')}
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      {t('clients.oib')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      {t('clients.notes')}
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Datum kreiranja</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('updated_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Datum ažuriranja</span>
                        {getSortIcon('updated_at')}
                      </div>
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
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          {client.created_at ? formatDate(client.created_at) : '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          {client.updated_at ? formatDate(client.updated_at) : '-'}
                        </div>
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
