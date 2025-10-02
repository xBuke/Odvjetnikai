'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  oib: string;
  notes: string;
}

interface Case {
  id: number;
  title: string;
  status: 'Active' | 'In Review' | 'Pending' | 'Closed';
  statusColor: 'green' | 'yellow' | 'blue' | 'gray';
  caseType: string;
  lastActivity: string;
  description: string;
}

interface Document {
  id: number;
  title: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'Uploaded' | 'In Review' | 'Approved' | 'Rejected';
  statusColor: 'blue' | 'yellow' | 'green' | 'red';
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock cases data (for now - in a real app, this would come from an API)
  const mockCases: Case[] = [
    {
      id: 1,
      title: 'Horvat protiv Zagrebačke banke - Spor ugovora',
      status: 'Active',
      statusColor: 'green',
      caseType: 'Spor ugovora',
      lastActivity: '2 sata prije',
      description: 'Slučaj kršenja ugovora koji uključuje licencni ugovor za softver.'
    },
    {
      id: 2,
      title: 'Osnivanje tvrtke Horvat d.o.o.',
      status: 'In Review',
      statusColor: 'yellow',
      caseType: 'Osnivanje tvrtke',
      lastActivity: '1 dan prije',
      description: 'Osnivanje nove d.o.o. za tehnološko savjetovanje.'
    },
    {
      id: 3,
      title: 'Pregled radnog ugovora - Horvat',
      status: 'Pending',
      statusColor: 'blue',
      caseType: 'Radno pravo',
      lastActivity: '3 dana prije',
      description: 'Pregled izvršnog radnog ugovora za novog zaposlenika.'
    }
  ];

  // Mock documents data (for now - in a real app, this would come from an API)
  const mockDocuments: Document[] = [
    {
      id: 1,
      title: 'Ugovor o suradnji - Zagrebačka banka.pdf',
      type: 'Ugovor',
      uploadDate: '2024-12-01',
      size: '2.4 MB',
      status: 'Approved',
      statusColor: 'green'
    },
    {
      id: 2,
      title: 'Zahtjev za dozvolu za obavljanje djelatnosti.pdf',
      type: 'Pravni dokument',
      uploadDate: '2024-11-28',
      size: '1.8 MB',
      status: 'In Review',
      statusColor: 'yellow'
    },
    {
      id: 3,
      title: 'Nacrt radnog ugovora.docx',
      type: 'Nacrt dokumenta',
      uploadDate: '2024-11-25',
      size: '856 KB',
      status: 'Uploaded',
      statusColor: 'blue'
    },
    {
      id: 4,
      title: 'Financijski izvještaj 2024.xlsx',
      type: 'Financijski dokument',
      uploadDate: '2024-11-20',
      size: '3.2 MB',
      status: 'Approved',
      statusColor: 'green'
    }
  ];


  // Load client data from Supabase
  const loadClientData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch client data from Supabase
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) {
        throw clientError;
      }

      if (clientData) {
        setClient(clientData);
      }
    } catch (err) {
      console.error('Error loading client:', err);
      setError('Greška pri učitavanju detalja klijenta. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In Review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'Closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In Review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Uploaded':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Učitavanje detalja klijenta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/clients')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Natrag na klijente</span>
            </button>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Greška pri učitavanju klijenta</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={loadClientData}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              Pokušaj ponovno
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/clients')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Natrag na klijente</span>
            </button>
          </div>
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Klijent nije pronađen</h2>
            <p className="text-muted-foreground">Klijent koji tražite ne postoji.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/clients')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Natrag na klijente</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <p className="text-muted-foreground">Detalji klijenta</p>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Informacije o klijentu</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ime</p>
                  <p className="text-foreground">{client.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-pošta</p>
                  <p className="text-foreground">{client.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                  <p className="text-foreground">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">OIB</p>
                  <p className="text-foreground">{client.oib}</p>
                </div>
              </div>
            </div>
          </div>
          {client.notes && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Bilješke</p>
                  <p className="text-foreground">{client.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linked Cases */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Povezani predmeti</h2>
        </div>
        <div className="p-6">
          {mockCases.length > 0 ? (
            <div className="space-y-4">
              {mockCases.map((caseItem) => (
                <div key={caseItem.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(caseItem.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">{caseItem.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{caseItem.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-muted-foreground">{caseItem.caseType}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Last activity: {caseItem.lastActivity}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      caseItem.statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      caseItem.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      caseItem.statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {caseItem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nema predmeta povezanih s ovim klijentom.</p>
            </div>
          )}
        </div>
      </div>

      {/* Linked Documents */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Povezani dokumenti</h2>
        </div>
        <div className="p-6">
          {mockDocuments.length > 0 ? (
            <div className="space-y-4">
              {mockDocuments.map((document) => (
                <div key={document.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200">
                  <div className="flex-shrink-0">
                    {getDocumentStatusIcon(document.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{document.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{document.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{document.size}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Uploaded: {document.uploadDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      document.statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      document.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      document.statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {document.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200" title="View document">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200" title="Download document">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nema dokumenata povezanih s ovim klijentom.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

