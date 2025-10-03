'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Gavel,
  MessageSquare,
  ExternalLink,
  FolderOpen,
  X,
  Loader2,
  Edit
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { selectSingleWithUserId } from '@/lib/supabaseHelpers';


interface Case {
  id: string;
  title: string;
  client_id: string;
  status: 'Open' | 'In Progress' | 'Closed';
  notes: string;
  created_at: string;
  readonly updated_at?: string; // Read-only, automatically managed by database trigger
  clients?: {
    name: string;
  };
}

interface TimelineEvent {
  id: string;
  type: 'hearing' | 'document' | 'meeting' | 'note' | 'status_change';
  title: string;
  description: string;
  date: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { } = useAuth();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'note' as TimelineEvent['type'],
    title: '',
    description: ''
  });


  // Mock timeline events
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: 'event-1-uuid-1234-5678-9abc-def012345678',
      type: 'hearing',
      title: 'Hearing scheduled',
      description: 'Preliminary hearing scheduled for December 20, 2024 at 10:00 AM',
      date: '2024-12-01',
      time: '09:30',
      icon: Gavel,
      iconColor: 'text-blue-600'
    },
    {
      id: 'event-2-uuid-2345-6789-abcd-ef0123456789',
      type: 'document',
      title: 'Document uploaded',
      description: 'Contract agreement and supporting documents uploaded to case file',
      date: '2024-11-28',
      time: '14:15',
      icon: Upload,
      iconColor: 'text-green-600'
    },
    {
      id: 'event-3-uuid-3456-789a-bcde-f01234567890',
      type: 'meeting',
      title: 'Client meeting',
      description: 'Initial consultation with client to discuss case strategy',
      date: '2024-11-25',
      time: '11:00',
      icon: MessageSquare,
      iconColor: 'text-purple-600'
    },
    {
      id: 'event-4-uuid-4567-89ab-cdef-012345678901',
      type: 'status_change',
      title: 'Status changed',
      description: 'Case status updated from Open to In Progress',
      date: '2024-11-20',
      time: '16:45',
      icon: CheckCircle,
      iconColor: 'text-yellow-600'
    },
    {
      id: 'event-5-uuid-5678-9abc-def0-123456789012',
      type: 'note',
      title: 'Case created',
      description: 'New case file created and initial documentation prepared',
      date: '2024-11-15',
      time: '10:00',
      icon: FileText,
      iconColor: 'text-gray-600'
    }
  ]);


  // Load case data from Supabase
  const loadCaseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch case with client information from Supabase
      const caseData = await selectSingleWithUserId(supabase, 'cases', 'id', caseId, '*, clients(name, email, phone, oib, notes)') as unknown as Case;
      setCaseData(caseData);
    } catch (err) {
      console.error('Error loading case:', err);
      setError('Greška pri učitavanju detalja predmeta. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCaseData();
  }, [loadCaseData]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventIcons = {
      hearing: { icon: Gavel, color: 'text-blue-600' },
      document: { icon: Upload, color: 'text-green-600' },
      meeting: { icon: MessageSquare, color: 'text-purple-600' },
      note: { icon: FileText, color: 'text-gray-600' },
      status_change: { icon: CheckCircle, color: 'text-yellow-600' }
    };

    const now = new Date();
    const newTimelineEvent: TimelineEvent = {
      id: Date.now().toString(),
      type: newEvent.type,
      title: newEvent.title,
      description: newEvent.description,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      icon: eventIcons[newEvent.type].icon,
      iconColor: eventIcons[newEvent.type].color
    };

    setTimelineEvents(prev => [newTimelineEvent, ...prev]);
    setNewEvent({ type: 'note', title: '', description: '' });
    setIsAddEventModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Učitavanje detalja predmeta...</p>
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
              onClick={() => router.push('/cases')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Natrag na predmete</span>
            </button>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Greška pri učitavanju predmeta</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={loadCaseData}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              Pokušaj ponovno
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/cases')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Natrag na predmete</span>
            </button>
          </div>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Predmet nije pronađen</h2>
            <p className="text-muted-foreground">Predmet koji tražite ne postoji.</p>
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
            onClick={() => router.push('/cases')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Natrag na predmete</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{caseData.title}</h1>
            <p className="text-muted-foreground">Detalji predmeta</p>
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Informacije o predmetu</h2>
            <button
              onClick={() => router.push(`/cases/${caseId}/edit`)}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
              title="Uredi predmet"
            >
              <Edit className="w-4 h-4" />
              <span>Uredi</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Naziv</p>
                  <p className="text-foreground">{caseData.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Klijent</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-foreground">{caseData.clients?.name || 'Nepoznati klijent'}</p>
                    <button
                      onClick={() => router.push(`/clients/${caseData.client_id}`)}
                      className="text-primary hover:text-primary/80 transition-colors duration-200"
                      title="View client details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getStatusIcon(caseData.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    caseData.status === 'Open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    caseData.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    caseData.status === 'Closed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {caseData.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Datum kreiranja</p>
                  <p className="text-foreground">{formatDate(caseData.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
          {caseData.notes && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Bilješke</p>
                  <p className="text-foreground">{caseData.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Links */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Related</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push(`/clients/${caseData.client_id}`)}
            className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200 text-left"
          >
            <User className="w-8 h-8 text-primary" />
            <div>
            <h4 className="font-medium text-foreground">Prikaži klijenta</h4>
            <p className="text-sm text-muted-foreground">Pogledaj detalje i informacije o klijentu</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200 text-left">
            <FolderOpen className="w-8 h-8 text-green-600" />
            <div>
            <h4 className="font-medium text-foreground">Dokumenti predmeta</h4>
            <p className="text-sm text-muted-foreground">Pogledaj i upravljaj dokumentima predmeta</p>
            </div>
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Vremenska linija predmeta</h2>
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj događaj</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${event.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < timelineEvents.length - 1 && (
                      <div className="w-px h-6 bg-border ml-5 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(event.date, event.time)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Dodaj događaj u vremensku liniju</h3>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-foreground mb-1">
                  Vrsta događaja
                </label>
                <select
                  id="eventType"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as TimelineEvent['type'] }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                >
                  <option value="note">Bilješka</option>
                  <option value="hearing">Rasprava</option>
                  <option value="document">Dokument</option>
                  <option value="meeting">Sastanak</option>
                  <option value="status_change">Promjena statusa</option>
                </select>
              </div>

              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-foreground mb-1">
                  Naziv *
                </label>
                <input
                  type="text"
                  id="eventTitle"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                  placeholder="Unesite naziv događaja"
                />
              </div>

              <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-foreground mb-1">
                  Opis *
                </label>
                <textarea
                  id="eventDescription"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                  placeholder="Unesite opis događaja"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Dodaj događaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

