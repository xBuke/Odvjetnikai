'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  FileText, 
  Clock, 
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormSelect, FormTextarea, FormActions } from '../../components/ui/Form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import TrialBanner from '@/components/billing/TrialBanner';
import { supabase } from '@/lib/supabaseClient';
import { 
  selectWithUserId, 
  insertWithUserId, 
  updateWithUserId, 
  deleteWithUserId 
} from '@/lib/supabaseHelpers';
import type { Client, Case, BillingEntry } from '@/types/supabase';

// Use generated types from Supabase

type BillingEntryWithDetails = BillingEntry & {
  clientName: string;
  caseName: string;
  total: number;
};

interface TimeEntryForm {
  client_id: string;
  case_id: string;
  hours: number;
  rate: number;
  notes: string;
}

export default function BillingPage() {
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

  // Get user session for multitenancy
  const { profile } = useAuth();

  // State management
  const [billingEntries, setBillingEntries] = useState<BillingEntryWithDetails[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BillingEntryWithDetails | null>(null);
  const [formData, setFormData] = useState<TimeEntryForm>({
    client_id: '',
    case_id: '',
    hours: 0,
    rate: 0,
    notes: ''
  });
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingInvoices] = useState([
    { id: '1', invoiceNumber: 'INV-000001', client: 'Horvat & Partneri', date: '2024-12-01', total: 2125, status: 'paid' },
    { id: '2', invoiceNumber: 'INV-000002', client: 'Obiteljski fond Novak', date: '2024-11-28', total: 2400, status: 'sent' },
    { id: '3', invoiceNumber: 'INV-000003', client: 'Kovačević & Suradnici', date: '2024-11-25', total: 1650, status: 'overdue' },
    { id: '4', invoiceNumber: 'INV-000004', client: 'Babić Nekretnine', date: '2024-11-20', total: 1012.5, status: 'paid' },
    { id: '5', invoiceNumber: 'INV-000005', client: 'Jurić Tehnologija d.o.o.', date: '2024-11-15', total: 4500, status: 'sent' }
  ]);

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

  // Load cases from Supabase
  const loadCases = useCallback(async () => {
    try {
      const data = await selectWithUserId(supabase, 'cases') as unknown as Case[];
      setCases(data || []);
    } catch (err) {
      console.error('Error loading cases:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cases. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    }
  }, [showToast]);

  // Load billing entries from Supabase with client and case joins
  const loadBillingEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await selectWithUserId(supabase, 'billing_entries', {}, '*, clients(name), cases(title)') as unknown as Record<string, unknown>[];

      // Transform data to include clientName, caseName, and total
      const entriesWithDetails: BillingEntryWithDetails[] = (data || []).map(entry => ({
        ...entry,
        clientName: (entry.clients as Record<string, unknown>)?.name as string || t('billing.unknownClient'),
        caseName: (entry.cases as Record<string, unknown>)?.title as string || t('billing.unknownCase'),
        total: (entry.hours as number) * (entry.rate as number)
      } as BillingEntryWithDetails));

      setBillingEntries(entriesWithDetails);
    } catch (err) {
      console.error('Error loading billing entries:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load billing entries. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadClients(),
        loadCases(),
        loadBillingEntries()
      ]);
    };
    loadData();
  }, [loadBillingEntries, loadCases, loadClients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' || name === 'rate' ? parseFloat(value) || 0 : value
    }));
  };

  // Create new billing entry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.case_id || formData.hours <= 0 || formData.rate <= 0) {
      setError(t('billing.fillAllFields'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await insertWithUserId(supabase, 'billing_entries', {
        client_id: formData.client_id,
        case_id: formData.case_id,
        hours: formData.hours,
        rate: formData.rate,
        notes: formData.notes
      });

      // Refresh the billing entries
      await loadBillingEntries();
      
      // Reset form and close modal
      setFormData({ client_id: '', case_id: '', hours: 0, rate: 0, notes: '' });
      setIsModalOpen(false);
      setEditingEntry(null);
      
      // Show success toast
      showToast('Račun spremljen', 'success');
    } catch (err) {
      console.error('Error creating billing entry:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // Show more specific error message
      const errorMessage = err instanceof Error ? err.message : 'Greška pri spremanju računa. Molimo pokušajte ponovno.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri spremanju", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing billing entry
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEntry || !formData.client_id || !formData.case_id || formData.hours <= 0 || formData.rate <= 0) {
      setError(t('billing.fillAllFields'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await updateWithUserId(supabase, 'billing_entries', 'id', editingEntry.id, {
        client_id: formData.client_id,
        case_id: formData.case_id,
        hours: formData.hours,
        rate: formData.rate,
        notes: formData.notes
      });

      // Refresh the billing entries
      await loadBillingEntries();
      
      // Reset form and close modal
      setFormData({ client_id: '', case_id: '', hours: 0, rate: 0, notes: '' });
      setIsModalOpen(false);
      setEditingEntry(null);
      
      // Show success toast
      showToast('Račun spremljen', 'success');
    } catch (err) {
      console.error('Error updating billing entry:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // Show more specific error message
      const errorMessage = err instanceof Error ? err.message : 'Greška pri spremanju računa. Molimo pokušajte ponovno.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri spremanju", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete billing entry
  const handleDelete = async (entryId: string) => {
    if (!confirm(t('billing.confirmDelete'))) {
      return;
    }

    try {
      setError(null);

      await deleteWithUserId(supabase, 'billing_entries', 'id', entryId);

      // Refresh the billing entries
      await loadBillingEntries();
    } catch (err) {
      console.error('Error deleting billing entry:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // Show more specific error message
      const errorMessage = err instanceof Error ? err.message : t('billing.failedToDeleteEntry');
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri spremanju", 'error');
    }
  };

  // Open edit modal
  const handleEdit = (entry: BillingEntryWithDetails) => {
    setEditingEntry(entry);
    setFormData({
      client_id: entry.client_id,
      case_id: entry.case_id || '',
      hours: entry.hours,
      rate: entry.rate,
      notes: entry.notes || ''
    });
    setIsModalOpen(true);
  };

  // Open add modal
  const handleAdd = () => {
    setEditingEntry(null);
    setFormData({ client_id: '', case_id: '', hours: 0, rate: 0, notes: '' });
    setIsModalOpen(true);
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === billingEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(billingEntries.map(entry => entry.id));
    }
  };

  const generateInvoice = () => {
    if (selectedEntries.length === 0) {
      setError(t('billing.selectEntriesForInvoice'));
      return;
    }
    
    // Generate a unique invoice ID
    const invoiceId = new Date().getTime().toString();
    
    // Create invoice data and navigate to specific invoice page
    const invoiceData = {
      entries: billingEntries.filter(entry => selectedEntries.includes(entry.id)),
      total: billingEntries
        .filter(entry => selectedEntries.includes(entry.id))
        .reduce((sum, entry) => sum + entry.total, 0)
    };
    
    // Store in sessionStorage for the invoice preview page
    sessionStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    
    // Navigate to specific invoice page
    window.open(`/billing/invoice/${invoiceId}`, '_blank');
  };

  const totalAmount = billingEntries.reduce((sum, entry) => sum + entry.total, 0);
  const selectedTotal = billingEntries
    .filter(entry => selectedEntries.includes(entry.id))
    .reduce((sum, entry) => sum + entry.total, 0);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Trial Banner */}
      {profile && <TrialBanner profile={profile} />}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              {t('common.dismiss')}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1 sm:mb-2 truncate">{t('billing.title')}</h2>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">{t('billing.subtitle')}</p>
          </div>
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 lg:flex-shrink-0">
            <div className="text-left lg:text-right">
              <p className="text-xs sm:text-sm text-muted-foreground">{t('billing.totalOutstanding')}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">${totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">{t('billing.addTimeEntry')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing Invoices */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-3 sm:p-4 lg:p-4 border-b border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{t('billing.recentInvoices')}</h3>
        </div>
        
        {/* Mobile Card Layout */}
        <div className="block sm:hidden">
          <div className="divide-y divide-border">
            {existingInvoices.map((invoice) => (
              <div key={invoice.id} className="p-3 sm:p-4 hover:bg-accent transition-colors duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <User className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{invoice.client}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{invoice.invoiceNumber}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {t(`billing.${invoice.status}`)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{invoice.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">${invoice.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                    <button
                      onClick={() => window.open(`/billing/invoice/${invoice.id}`, '_blank')}
                      className="text-primary hover:text-primary/80 text-xs font-medium transition-colors duration-200"
                    >
                      {t('common.view')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('billing.invoiceNumber')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('billing.client')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  {t('common.date')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('billing.amount')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('common.status')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {existingInvoices.map((invoice, index) => (
                <tr key={invoice.id} className={`hover:bg-accent transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                }`}>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-foreground truncate max-w-[150px]">{invoice.client}</span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-foreground">{invoice.date}</span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">${invoice.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {t(`billing.${invoice.status}`)}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => window.open(`/billing/invoice/${invoice.id}`, '_blank')}
                      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
                    >
                      {t('common.view')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-3 sm:p-4 lg:p-4 border-b border-border">
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{t('billing.billingEntries')}</h3>
            {selectedEntries.length > 0 && (
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {selectedEntries.length} {t('common.selected')} • {t('common.total')}: ${selectedTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </span>
                <button
                  onClick={generateInvoice}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span className="truncate">{t('billing.generateInvoice')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">{t('billing.loadingEntries')}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && billingEntries.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('billing.noBillingEntries')}</h3>
            <p className="text-muted-foreground mb-4">{t('billing.getStarted')}</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>{t('billing.addTimeEntry')}</span>
            </button>
          </div>
        )}

        {/* Mobile Card Layout */}
        {!loading && billingEntries.length > 0 && (
          <div className="block sm:hidden">
            <div className="divide-y divide-border">
              {billingEntries.map((entry) => (
                <div key={entry.id} className="p-3 sm:p-4 hover:bg-accent transition-colors duration-200">
                  <div className="flex items-start space-x-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => handleSelectEntry(entry.id)}
                      className="rounded border-border text-primary focus:ring-primary mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <User className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">{entry.clientName}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Briefcase className="w-3 h-3 mr-1" />
                        <span className="truncate">{entry.caseName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-muted-foreground hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(entry.created_at).toLocaleDateString('en-US')}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{entry.hours}h</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="w-3 h-3 mr-1" />
                      <span>${entry.rate}/h</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">${entry.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">{t('billing.notes')}:</span> {entry.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Table Layout */}
        {!loading && billingEntries.length > 0 && (
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEntries.length === billingEntries.length && billingEntries.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('billing.client')}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    {t('billing.case')}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    {t('common.date')}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('billing.hours')}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    {t('billing.rate')}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('common.total')}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {billingEntries.map((entry, index) => (
                  <tr key={entry.id} className={`hover:bg-accent transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                  }`}>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{entry.clientName}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-foreground truncate max-w-[150px]">{entry.caseName}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-foreground">{new Date(entry.created_at).toLocaleDateString('en-US')}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-foreground">{entry.hours}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-foreground">${entry.rate}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">${entry.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                          title="Edit entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-muted-foreground hover:text-red-600 transition-colors duration-200"
                          title="Delete entry"
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

      {/* Time Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
          setFormData({ client_id: '', case_id: '', hours: 0, rate: 0, notes: '' });
        }}
        title={editingEntry ? t('billing.editTimeEntry') : t('billing.addTimeEntry')}
        size="sm"
      >
        <form onSubmit={editingEntry ? handleUpdate : handleSubmit} className="space-y-3 sm:space-y-4">
          <FormField label={t('billing.client')} required>
            <FormSelect
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
              required
              className="text-sm sm:text-base"
            >
              <option value="">{t('billing.selectClient')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label={t('billing.case')} required>
            <FormSelect
              name="case_id"
              value={formData.case_id}
              onChange={handleInputChange}
              required
              className="text-sm sm:text-base"
            >
              <option value="">{t('billing.selectCase')}</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField label={t('billing.hours')} required>
              <FormInput
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                min={0}
                step={0.25}
                placeholder="0.00"
                required
                className="text-sm sm:text-base"
              />
            </FormField>

            <FormField label={t('billing.ratePerHour')} required>
              <FormInput
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                min={0}
                step={0.01}
                placeholder="0.00"
                required
                className="text-sm sm:text-base"
              />
            </FormField>
          </div>

          <FormField label={t('billing.notes')}>
            <FormTextarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder={t('billing.optionalNotes')}
              className="text-sm sm:text-base"
              rows={3}
            />
          </FormField>

          <FormActions
            onCancel={() => {
              setIsModalOpen(false);
              setEditingEntry(null);
              setFormData({ client_id: '', case_id: '', hours: 0, rate: 0, notes: '' });
            }}
            submitText={editingEntry ? t('billing.updateEntry') : t('common.add')}
            isLoading={submitting}
          />
        </form>
      </Modal>
    </div>
  );
}
