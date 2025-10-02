'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormTextarea, FormSelect, FormActions } from '../../components/ui/Form';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/Toast';

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

interface Case {
  id: string;
  title: string;
  client_id: string;
  status: 'Open' | 'In Progress' | 'Closed';
  notes: string;
  created_at: string;
  updated_at?: string;
  clients?: {
    name: string;
  };
}

interface CaseWithClient extends Case {
  clientName: string;
  statusColor: 'blue' | 'yellow' | 'green';
}

export default function CasesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
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


  // Load clients from Supabase
  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Greška pri učitavanju klijenata. Molimo pokušajte ponovno.');
    }
  };


  // Load cases from Supabase with client information
  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cases')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to include clientName and statusColor
      const casesWithClient: CaseWithClient[] = (data || []).map(caseItem => ({
        ...caseItem,
        clientName: caseItem.clients?.name || 'Nepoznati klijent',
        statusColor: getStatusColor(caseItem.status)
      }));

      setCases(casesWithClient);
    } catch (err) {
      console.error('Error loading cases:', err);
      setError('Greška pri učitavanju predmeta. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadClients(), loadCases()]);
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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


      if (editingCase) {
        // Update existing case
        const { error } = await supabase
          .from('cases')
          .update({
            title: formData.title,
            client_id: parseInt(formData.client_id),
            status: formData.status,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCase.id);

        if (error) {
          throw error;
        }
      } else {
        // Add new case
        const { data, error } = await supabase
          .from('cases')
          .insert([{
            title: formData.title,
            client_id: parseInt(formData.client_id),
            status: formData.status,
            notes: formData.notes
          }])
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log('Case created successfully:', data);
        showToast('✔ Predmet uspješno dodan', 'success');

        // Redirect to cases list instead of detail page
        router.push('/cases');
        return; // Exit early to prevent form reset
      }

      // Reload cases and reset form (only for updates)
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
      setError('Greška pri spremanju predmeta. Molimo pokušajte ponovno.');
      showToast('✖ Došlo je do greške', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (caseItem: CaseWithClient) => {
    setEditingCase(caseItem);
    setFormData({
      title: caseItem.title,
      client_id: caseItem.client_id.toString(),
      status: caseItem.status,
      notes: caseItem.notes
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (caseId: string) => {
    if (confirm(t('cases.deleteConfirm'))) {
      try {
        setError(null);


        const { error } = await supabase
          .from('cases')
          .delete()
          .eq('id', caseId);

        if (error) {
          throw error;
        }

        // Reload cases after deletion
        await loadCases();
      } catch (err) {
        console.error('Error deleting case:', err);
        setError('Greška pri brisanju predmeta. Molimo pokušajte ponovno.');
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('cases.caseTitle')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    {t('cases.linkedClient')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    {t('cases.createdDate')}
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