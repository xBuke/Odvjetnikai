'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Clock,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface BillingEntry {
  id: string;
  client: string;
  case: string;
  hours: number;
  rate: number;
  total: number;
  date: string;
}

interface InvoiceData {
  entries: BillingEntry[];
  total: number;
}

export default function InvoicePreviewPage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [invoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    // Get invoice data from sessionStorage
    const storedData = sessionStorage.getItem('invoiceData');
    if (storedData) {
      setInvoiceData(JSON.parse(storedData));
    } else {
      // Fallback to mock data if no data in sessionStorage
      setInvoiceData({
        entries: [
          {
            id: '1',
            client: 'Smith & Associates',
            case: 'Smith vs. Johnson Corp',
            hours: 8.5,
            rate: 250,
            total: 2125,
            date: '2024-12-10'
          }
        ],
        total: 2125
      });
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, this would generate a PDF
    alert('PDF download functionality would be implemented here');
  };

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Invoice Data</h2>
          <p className="text-muted-foreground mb-4">No billing entries were selected for this invoice.</p>
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

  const clientName = invoiceData.entries[0]?.client || 'Unknown Client';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/billing"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Billing</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                <p className="text-blue-100">Professional Legal Services</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-6 h-6" />
                  <span className="text-xl font-semibold">#{invoiceNumber}</span>
                </div>
                <p className="text-blue-100">Date: {invoiceDate}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* From */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">From:</h3>
                <div className="text-muted-foreground">
                  <p className="font-semibold">LawFirm SaaS</p>
                  <p>123 Legal Street</p>
                  <p>Law City, LC 12345</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: billing@lawfirm.com</p>
                </div>
              </div>

              {/* To */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">To:</h3>
                <div className="text-muted-foreground">
                  <p className="font-semibold">{clientName}</p>
                  <p>Client Address</p>
                  <p>City, State ZIP</p>
                  <p>Phone: (555) 987-6543</p>
                  <p>Email: client@email.com</p>
                </div>
              </div>
            </div>

            {/* Billing Entries Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Services Rendered</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Case
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoiceData.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 text-muted-foreground mr-2" />
                            {entry.case}
                          </div>
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
                          ${entry.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                    <span className="text-sm font-medium text-foreground">
                      ${invoiceData.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Tax (0%):</span>
                    <span className="text-sm font-medium text-foreground">$0.00</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total:</span>
                      <span className="text-lg font-bold text-foreground">
                        ${invoiceData.total.toLocaleString()}
                      </span>
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
                For questions regarding this invoice, please contact our billing department.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p>Thank you for your business!</p>
              <p className="mt-1">This invoice was generated on {new Date().toLocaleDateString()}</p>
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
        }
      `}</style>
    </div>
  );
}
