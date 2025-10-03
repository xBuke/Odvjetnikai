'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormTextarea, FormSelect, FormActions } from '../../components/ui/Form';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  selectWithUserId, 
  selectWithUserIdAndOrder,
  insertAndReturnWithUserId, 
  updateWithUserId, 
  deleteWithUserId 
} from '@/lib/supabaseHelpers';
import { useUserPreferences, SortDirection } from '@/lib/userPreferences';
import TrialBanner from '@/components/billing/TrialBanner';
import { canCreateEntity } from '@/lib/ui-limit';
import type { Client, Case } from '@/types/supabase';

// Use generated types from Supabase
type CaseWithClient = Case & {
  clientName: string;
  statusColor: 'blue' | 'yellow' | 'green';
  clients?: {
    name: string;
  };
};

// TypeScript interfaces for sorting (extended from shared types)
type CasesSortField = 'title' | 'status' | 'created_at' | 'updated_at' | 'client_name';

export default function CasesPage() {
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
  const [cases, setCases] = useState<CaseWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseWithClient | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    status: 'Open' as 'Open' | 'In Progress' | 'Closed',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting state with Supabase persistence
  const [sortField, setSortField] = useState<CasesSortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Use shared user preferences utility
  const { loadPreferences, savePreferences } = useUserPreferences('cases', showToast);

  // Load user preferences from Supabase
  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = await loadPreferences();
      setSortField(preferences.sortField as CasesSortField);
      setSortDirection(preferences.sortDirection);
    } catch (err) {
      console.error('Error loading user preferences:', err);
    } finally {
      setPreferencesLoaded(true);
    }
  }, [loadPreferences]);

  // Load clients from Supabase
  const loadClients = useCallback(async () => {
    try {
      const data = await selectWithUserId(supabase, 'clients') as unknown as Client[];
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load clients. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    }
  }, [showToast]);


  // Load cases from Supabase with client information and sorting
  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Map frontend sort field to database column
      const getSortColumn = (field: CasesSortField) => {
        switch (field) {
          case 'client_name':
            return 'clients.name'; // This won't work directly, we'll handle client sorting differently
          case 'title':
            return 'title';
          case 'status':
            return 'status';
          case 'created_at':
            return 'created_at';
          case 'updated_at':
            return 'updated_at';
          default:
            return 'created_at';
        }
      };

      const sortColumn = getSortColumn(sortField);
      const orderBy = {
        column: sortColumn,
        ascending: sortDirection === 'asc'
      };

      // For client name sorting, we need to handle it differently since it's a joined field
      let data: Record<string, unknown>[];
      
      if (sortField === 'client_name') {
        // For client name sorting, we'll fetch all data and sort in JavaScript
        // This is not ideal for large datasets, but works for the current use case
        data = await selectWithUserId(supabase, 'cases', {}, 'id, title, status, notes, created_at, updated_at, clients(name)') as unknown as Record<string, unknown>[];
        
        // Sort by client name in JavaScript
        data.sort((a, b) => {
          const aName = (a.clients as Record<string, unknown>)?.name as string || '';
          const bName = (b.clients as Record<string, unknown>)?.name as string || '';
          const comparison = aName.localeCompare(bName);
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      } else {
        // For other fields, use database sorting
        data = await selectWithUserIdAndOrder(supabase, 'cases', {}, 'id, title, status, notes, created_at, updated_at, clients(name)', orderBy) as unknown as Record<string, unknown>[];
      }

      // Transform data to include clientName and statusColor
      const casesWithClient: CaseWithClient[] = (data || []).map(caseItem => ({
        ...caseItem,
        clientName: (caseItem.clients as Record<string, unknown>)?.name as string || 'Nepoznati klijent',
        statusColor: getStatusColor(caseItem.status as string)
      } as CaseWithClient));

      setCases(casesWithClient);
    } catch (err) {
      console.error('Error loading cases:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cases. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection, showToast]);

  // Get status color based on status
  const getStatusColor = (status: string): 'blue' | 'yellow' | 'green' => {
    switch (status) {
      case 'Open':
        return 'blue';
      case 'In Progress':
        return 'yellow';
      case 'Closed':
        return 'green';
      default:
        return 'blue';
    }
  };

  // Handle sorting
  const handleSort = async (field: CasesSortField) => {
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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      // First load user preferences, then load cases and clients
      await loadUserPreferences();
      await Promise.all([loadClients(), loadCases()]);
    };
    loadData();
  }, [loadCases, loadClients, loadUserPreferences]);

  // Load cases when preferences are loaded and sorting changes
  useEffect(() => {
    if (preferencesLoaded) {
      loadCases();
    }
  }, [preferencesLoaded, sortField, sortDirection, loadCases]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      // Check trial limits for new cases
      if (!editingCase && profile) {
        const limitCheck = canCreateEntity(profile, cases.length);
        if (!limitCheck.ok) {
          showToast(limitCheck.reason || 'Greška pri kreiranju predmeta', 'error');
          setSubmitting(false);
          return;
        }
      }

      if (editingCase) {
        // Update existing case - only send fields that user can edit
        await updateWithUserId(
          supabase, 
          'cases', 
          'id', 
          editingCase.id, 
          {
            title: formData.title,
            client_id: formData.client_id,
            status: formData.status,
            notes: formData.notes
            // updated_at will be automatically set by database trigger
          }
        );

        // Case updated successfully
        showToast('✔ Predmet uspješno ažuriran', 'success');
        
        // Auto-close modal and reset form after successful update
        await loadCases();
        setFormData({ title: '', client_id: '', status: 'Open', notes: '' });
        setEditingCase(null);
        setIsModalOpen(false);
        return; // Exit early to prevent duplicate form reset
      } else {
        // Add new case
        await insertAndReturnWithUserId(supabase, 'cases', {
          title: formData.title,
          client_id: formData.client_id,
          status: formData.status,
          notes: formData.notes
        });

        // Case created successfully
        showToast('✔ Predmet uspješno dodan', 'success');

        // Redirect to cases list instead of detail page
        router.push('/cases');
        return; // Exit early to prevent form reset
      }

      // Reload cases and reset form (only for new cases)
      await loadCases();
      setFormData({ title: '', client_id: '', status: 'Open', notes: '' });
      setEditingCase(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving case:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // Show more specific error message
      const errorMessage = err instanceof Error ? err.message : 'Greška pri spremanju predmeta. Molimo pokušajte ponovno.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri spremanju", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (caseItem: CaseWithClient) => {
    setEditingCase(caseItem);
    setFormData({
      title: caseItem.title,
      client_id: caseItem.client_id,
      status: caseItem.status as 'Open' | 'In Progress' | 'Closed',
      notes: caseItem.notes || ''
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (caseId: string) => {
    if (confirm(t('cases.deleteConfirm'))) {
      try {
        setError(null);

        await deleteWithUserId(supabase, 'cases', 'id', caseId);

        // Reload cases after deletion
        await loadCases();
        showToast('✔ Predmet uspješno obrisan', 'success');
      } catch (err) {
        console.error('Error deleting case:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        
        // Show more specific error message
        const errorMessage = err instanceof Error ? err.message : 'Greška pri brisanju predmeta. Molimo pokušajte ponovno.';
        setError(errorMessage);
        showToast(errorMessage ?? "Greška pri spremanju", 'error');
      }
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCase(null);
    setFormData({ title: '', client_id: '', status: 'Open', notes: '' });
  };

  // Handle row click to navigate to case detail
  const handleRowClick = (caseId: string) => {
    router.push(`/cases/${caseId}`);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'In Progress':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'Closed':
        return <XCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      {profile && <TrialBanner profile={profile} />}
      
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('cases.title')}</h2>
            <p className="text-muted-foreground text-sm sm:text-base">{t('cases.subtitle')}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>{t('cases.addCase')}</span>
          </button>
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
                const newField = field as CasesSortField;
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
              <option value="title-asc">Naziv predmeta (A-Z)</option>
              <option value="title-desc">Naziv predmeta (Z-A)</option>
              <option value="client_name-asc">Klijent (A-Z)</option>
              <option value="client_name-desc">Klijent (Z-A)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            {cases.length} predmeta
            {profile && profile.subscription_status === 'trial' && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                ({cases.length}/20 iskorišteno tijekom triala)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">{t('cases.loadingCases')}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('cases.noCasesFound')}</h3>
            <p className="text-muted-foreground">{t('cases.getStarted')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('cases.caseTitle')}</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('client_name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('cases.linkedClient')}</span>
                      {getSortIcon('client_name')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('common.status')}</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('cases.createdDate')}</span>
                      {getSortIcon('created_at')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:bg-muted/80 transition-colors"
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
                {cases.map((caseItem, index) => (
                  <tr 
                    key={caseItem.id} 
                    className={`hover:bg-accent cursor-pointer transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                    }`}
                    onClick={() => handleRowClick(caseItem.id)}
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{caseItem.title}</div>
                          {caseItem.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {caseItem.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        {caseItem.clientName}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-2">
                          {getStatusIcon(caseItem.status)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          caseItem.statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          caseItem.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          caseItem.statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {caseItem.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        {formatDate(caseItem.created_at)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        {caseItem.updated_at ? formatDate(caseItem.updated_at) : '-'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div 
                        className="flex items-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleEdit(caseItem)}
                          className="text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors duration-200"
                          title="Edit case"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(caseItem.id)}
                          className="text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10 transition-colors duration-200"
                          title="Delete case"
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
        )}
      </div>

      {/* Add/Edit Case Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCase ? t('cases.editCase') : t('cases.addNewCase')}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t('cases.caseTitle')} required>
            <FormInput
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t('cases.enterCaseTitle')}
              required
            />
          </FormField>

          <FormField label={t('billing.client')} required>
            <FormSelect
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
              required
            >
              <option value="">{t('cases.selectClient')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label={t('common.status')} required>
            <FormSelect
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="Open">{t('cases.open')}</option>
              <option value="In Progress">{t('cases.inProgress')}</option>
              <option value="Closed">{t('cases.closed')}</option>
            </FormSelect>
          </FormField>

          <FormField label={t('cases.caseNotes')}>
            <FormTextarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder={t('cases.enterCaseNotes')}
            />
          </FormField>

          <FormActions
            onCancel={handleModalClose}
            onSubmit={() => {}}
            submitText={editingCase ? t('cases.updateCase') : t('cases.addCase')}
            isLoading={submitting}
          />
        </form>
      </Modal>
    </div>
  );
}