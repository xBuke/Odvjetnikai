'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Printer, 
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Clock,
  DollarSign,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface TimeEntry {
  id: string;
  date: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
}

interface CaseInfo {
  id: string;
  title: string;
  caseNumber: string;
  status: string;
  startDate: string;
}

interface ClientInfo {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: ClientInfo;
  case: CaseInfo;
  timeEntries: TimeEntry[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generationDate, setGenerationDate] = useState('');

  useEffect(() => {
    // Set generation date after component mounts to avoid hydration mismatch
    // Use stable date to avoid hydration mismatch
    const stableDate = new Date('2024-01-01'); // Use a fixed date for SSR consistency
    setGenerationDate(stableDate.toLocaleDateString('en-US'));
    
    // Mock data - in a real app, this would fetch from an API
    const mockInvoiceData: InvoiceData = {
      id: invoiceId,
      invoiceNumber: `INV-${invoiceId.padStart(6, '0')}`,
      date: '2024-12-10',
      dueDate: '2025-01-09',
      client: {
        id: '1',
        name: 'Marko Horvat',
        company: 'Horvat & Partneri',
        email: 'marko.horvat@zagreb.hr',
        phone: '+385 91 123 4567',
        address: 'Ilica 123',
        city: 'Zagreb',
        state: 'Grad Zagreb',
        zip: '10000'
      },
      case: {
        id: '1',
        title: 'Horvat protiv Zagrebačke banke - Spor ugovora',
        caseNumber: 'SLUČAJ-2024-001',
        status: 'Aktivan',
        startDate: '2024-10-15'
      },
      timeEntries: [
        {
          id: '1',
          date: '2024-12-10',
          description: 'Pregled i analiza ugovora',
          hours: 3.5,
          rate: 250,
          total: 875
        },
        {
          id: '2',
          date: '2024-12-09',
          description: 'Savjetovanje s klijentom i sastanak o strategiji',
          hours: 2.0,
          rate: 250,
          total: 500
        },
        {
          id: '3',
          date: '2024-12-08',
          description: 'Pravno istraživanje i priprema dokumenata',
          hours: 4.0,
          rate: 250,
          total: 1000
        },
        {
          id: '4',
          date: '2024-12-07',
          description: 'Podnošenje u sud i administrativni zadaci',
          hours: 1.5,
          rate: 200,
          total: 300
        },
        {
          id: '5',
          date: '2024-12-06',
          description: 'Pregled otkrivanja i priprema odgovora',
          hours: 5.0,
          rate: 250,
          total: 1250
        }
      ],
      subtotal: 3925,
      tax: 0,
      total: 3925,
      status: 'sent'
    };

    // Simulate API call
    setTimeout(() => {
      setInvoiceData(mockInvoiceData);
      setIsLoading(false);
    }, 500);
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Mock PDF download functionality
    alert(`Downloading PDF for Invoice ${invoiceData?.invoiceNumber}...\n\nIn a real application, this would generate and download a PDF file.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested invoice could not be found.</p>
          <Link
            href="/billing"
            className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Billing</span>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/billing"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Billing</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoiceData.status)}`}>
              {invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
            </span>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {/* Law Firm Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">LF</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">LawFirm SaaS</h1>
                  <p className="text-blue-100 text-lg">Professional Legal Services</p>
                  <div className="flex items-center space-x-4 mt-2 text-blue-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">123 Legal Street, Law City, LC 12345</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">(555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">billing@lawfirm.com</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-8 h-8" />
                  <span className="text-2xl font-bold">INVOICE</span>
                </div>
                <p className="text-blue-100 text-lg">#{invoiceData.invoiceNumber}</p>
                <p className="text-blue-100">Date: {new Date(invoiceData.date).toLocaleDateString('en-US')}</p>
                <p className="text-blue-100">Due: {new Date(invoiceData.dueDate).toLocaleDateString('en-US')}</p>
              </div>
            </div>
          </div>

          {/* Client and Case Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Client Information */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Bill To:
                </h3>
                <div className="text-muted-foreground space-y-1">
                  <p className="font-semibold text-lg">{invoiceData.client.name}</p>
                  <p className="font-medium">{invoiceData.client.company}</p>
                  <p>{invoiceData.client.address}</p>
                  <p>{invoiceData.client.city}, {invoiceData.client.state} {invoiceData.client.zip}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{invoiceData.client.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{invoiceData.client.email}</span>
                  </div>
                </div>
              </div>

              {/* Case Information */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Case Information:
                </h3>
                <div className="text-muted-foreground space-y-1">
                  <p className="font-semibold text-lg">{invoiceData.case.title}</p>
                  <p><span className="font-medium">Case Number:</span> {invoiceData.case.caseNumber}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      invoiceData.case.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      {invoiceData.case.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Start Date:</span> {new Date(invoiceData.case.startDate).toLocaleDateString('en-US')}</p>
                </div>
              </div>
            </div>

            {/* Time Entries Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Time Entries</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoiceData.timeEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-accent">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                            {new Date(entry.date).toLocaleDateString('en-US')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {entry.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                            {entry.hours}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-muted-foreground mr-2" />
                            ${entry.rate}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
                          ${entry.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="flex justify-end">
              <div className="w-80">
                <div className="bg-muted p-6 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="text-sm font-medium text-foreground">
                        ${invoiceData.subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tax (0%):</span>
                      <span className="text-sm font-medium text-foreground">$0.00</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold text-foreground">Total:</span>
                        <span className="text-xl font-bold text-foreground">
                          ${invoiceData.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mt-8 p-6 bg-primary/10 rounded-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">Payment Terms</h4>
              <p className="text-muted-foreground">
                Payment is due within 30 days of invoice date. Please remit payment to the address above.
                For questions regarding this invoice, please contact our billing department at (555) 123-4567.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p>Thank you for your business!</p>
              <p className="mt-1">This invoice was generated on {generationDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .bg-gray-50 {
            background: white !important;
          }
          
          .shadow-sm {
            box-shadow: none !important;
          }
          
          .border {
            border: 1px solid #000 !important;
          }
          
          .rounded-lg {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
