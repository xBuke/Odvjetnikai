'use client';

import { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Clock, 
  DollarSign,
  Calendar,
  User,
  Briefcase
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormActions } from '../../components/ui/Form';
import { useLanguage } from '@/contexts/LanguageContext';

interface BillingEntry {
  id: string;
  client: string;
  case: string;
  hours: number;
  rate: number;
  total: number;
  date: string;
}

interface TimeEntryForm {
  client: string;
  case: string;
  hours: number;
  rate: number;
}

export default function BillingPage() {
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch (error) {
    // Fallback function if context is not available
    t = (key: string) => key;
  }
  const [billingEntries, setBillingEntries] = useState<BillingEntry[]>([
    {
      id: '1',
      client: 'Horvat & Partneri',
      case: 'Horvat protiv Zagrebačke banke',
      hours: 8.5,
      rate: 250,
      total: 2125,
      date: '2024-12-10'
    },
    {
      id: '2',
      client: 'Obiteljski fond Novak',
      case: 'Novak - Planiranje nasljedstva',
      hours: 12.0,
      rate: 200,
      total: 2400,
      date: '2024-12-09'
    },
    {
      id: '3',
      client: 'Kovačević & Suradnici',
      case: 'Kovačević - Radni spor',
      hours: 6.0,
      rate: 275,
      total: 1650,
      date: '2024-12-08'
    },
    {
      id: '4',
      client: 'Babić Nekretnine',
      case: 'Babić - Nekretnine',
      hours: 4.5,
      rate: 225,
      total: 1012.5,
      date: '2024-12-07'
    },
    {
      id: '5',
      client: 'Jurić Tehnologija d.o.o.',
      case: 'Jurić - Zahtjev za patent',
      hours: 15.0,
      rate: 300,
      total: 4500,
      date: '2024-12-06'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TimeEntryForm>({
    client: '',
    case: '',
    hours: 0,
    rate: 0
  });

  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [existingInvoices] = useState([
    { id: '1', invoiceNumber: 'INV-000001', client: 'Horvat & Partneri', date: '2024-12-01', total: 2125, status: 'paid' },
    { id: '2', invoiceNumber: 'INV-000002', client: 'Obiteljski fond Novak', date: '2024-11-28', total: 2400, status: 'sent' },
    { id: '3', invoiceNumber: 'INV-000003', client: 'Kovačević & Suradnici', date: '2024-11-25', total: 1650, status: 'overdue' },
    { id: '4', invoiceNumber: 'INV-000004', client: 'Babić Nekretnine', date: '2024-11-20', total: 1012.5, status: 'paid' },
    { id: '5', invoiceNumber: 'INV-000005', client: 'Jurić Tehnologija d.o.o.', date: '2024-11-15', total: 4500, status: 'sent' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' || name === 'rate' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client || !formData.case || formData.hours <= 0 || formData.rate <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    const newEntry: BillingEntry = {
      id: Date.now().toString(),
      client: formData.client,
      case: formData.case,
      hours: formData.hours,
      rate: formData.rate,
      total: formData.hours * formData.rate,
      date: new Date().toISOString().split('T')[0]
    };

    setBillingEntries(prev => [newEntry, ...prev]);
    setFormData({ client: '', case: '', hours: 0, rate: 0 });
    setIsModalOpen(false);
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
      alert('Please select at least one billing entry to generate an invoice');
      return;
    }
    
    // Generate a unique invoice ID
    const invoiceId = Date.now().toString();
    
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
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">${totalAmount.toLocaleString()}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
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
                    <span className="text-sm font-medium text-foreground">${invoice.total.toLocaleString()}</span>
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
                    <span className="text-sm font-medium text-foreground">${invoice.total.toLocaleString()}</span>
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
                  {selectedEntries.length} {t('common.selected')} • {t('common.total')}: ${selectedTotal.toLocaleString()}
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

        {/* Mobile Card Layout */}
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
                      <span className="text-sm font-medium text-foreground truncate">{entry.client}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3 mr-1" />
                      <span className="truncate">{entry.case}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{entry.date}</span>
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
                    <span className="text-sm font-medium text-foreground">${entry.total.toLocaleString()}</span>
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
                      <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{entry.client}</span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-foreground truncate max-w-[150px]">{entry.case}</span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-foreground">{entry.date}</span>
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
                    <span className="text-sm font-medium text-foreground">${entry.total.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('billing.addTimeEntry')}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <FormField label={t('billing.client')} required>
            <FormInput
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              placeholder={t('billing.enterClientName')}
              required
              className="text-sm sm:text-base"
            />
          </FormField>

          <FormField label={t('billing.case')} required>
            <FormInput
              name="case"
              value={formData.case}
              onChange={handleInputChange}
              placeholder={t('billing.enterCaseName')}
              required
              className="text-sm sm:text-base"
            />
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

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitText={t('common.add')}
          />
        </form>
      </Modal>
    </div>
  );
}
