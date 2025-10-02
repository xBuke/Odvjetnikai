'use client';

import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

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
  clientId: number;
  clientName: string;
  status: 'Open' | 'In Progress' | 'Closed';
  statusColor: 'blue' | 'yellow' | 'green';
  createdDate: string;
  notes: string;
}

interface TimelineEvent {
  id: number;
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
  const caseId = parseInt(params.id as string);

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'note' as TimelineEvent['type'],
    title: '',
    description: ''
  });

  // Mock data - in a real app, this would come from an API
  const mockClients: Client[] = [
    {
      id: 1,
      name: 'Marko Horvat',
      email: 'marko.horvat@zagreb.hr',
      phone: '+385 91 123 4567',
      oib: '12345678901',
      notes: 'Korporativni klijent, preferira email komunikaciju'
    },
    {
      id: 2,
      name: 'Ana Novak',
      email: 'ana.novak@nekretnine.hr',
      phone: '+385 92 234 5678',
      oib: '23456789012',
      notes: 'Specijalist za nekretnine i trgovinu'
    },
    {
      id: 3,
      name: 'Petar Kovačević',
      email: 'petar.kovacevic@obitelj.hr',
      phone: '+385 95 345 6789',
      oib: '34567890123',
      notes: 'Dugogodišnji klijent, obiteljsko pravo'
    },
    {
      id: 4,
      name: 'Ivana Babić',
      email: 'ivana.babic@poduzetnik.hr',
      phone: '+385 98 456 7890',
      oib: '45678901234',
      notes: 'Osnivanje tvrtki i ugovori'
    },
    {
      id: 5,
      name: 'Tomislav Jurić',
      email: 'tomislav.juric@tehnologija.hr',
      phone: '+385 99 567 8901',
      oib: '56789012345',
      notes: 'Specijalist za intelektualno vlasništvo i patente'
    }
  ];

  const mockCases: Case[] = [
    {
      id: 1,
      title: 'Horvat protiv Zagrebačke banke - Spor ugovora',
      clientId: 1,
      clientName: 'Marko Horvat',
      status: 'In Progress',
      statusColor: 'yellow',
      createdDate: '2024-11-15',
      notes: 'Slučaj kršenja ugovora koji uključuje licencni ugovor za softver. Faza otkrivanja u tijeku.'
    },
    {
      id: 2,
      title: 'Novak - Trgovina nekretninama',
      clientId: 2,
      clientName: 'Ana Novak',
      status: 'Open',
      statusColor: 'blue',
      createdDate: '2024-11-20',
      notes: 'Pregled i pregovaranje ugovora o kupnji komercijalne nekretnine.'
    },
    {
      id: 3,
      title: 'Kovačević - Obiteljsko pravo',
      clientId: 3,
      clientName: 'Petar Kovačević',
      status: 'Closed',
      statusColor: 'green',
      createdDate: '2024-10-10',
      notes: 'Razvodni sporazum finaliziran. Svi dokumenti potpisani i podneseni.'
    },
    {
      id: 4,
      title: 'Babić - Osnivanje tvrtke',
      clientId: 4,
      clientName: 'Ivana Babić',
      status: 'In Progress',
      statusColor: 'yellow',
      createdDate: '2024-11-25',
      notes: 'Osnivanje nove d.o.o. za tehnološko savjetovanje. Statut podnesen.'
    },
    {
      id: 5,
      title: 'Jurić - Zahtjev za patent',
      clientId: 5,
      clientName: 'Tomislav Jurić',
      status: 'Open',
      statusColor: 'blue',
      createdDate: '2024-12-01',
      notes: 'Zahtjev za patent za inovativni softverski algoritam. Početna prijava završena.'
    }
  ];

  // Mock timeline events
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: 1,
      type: 'hearing',
      title: 'Hearing scheduled',
      description: 'Preliminary hearing scheduled for December 20, 2024 at 10:00 AM',
      date: '2024-12-01',
      time: '09:30',
      icon: Gavel,
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      type: 'document',
      title: 'Document uploaded',
      description: 'Contract agreement and supporting documents uploaded to case file',
      date: '2024-11-28',
      time: '14:15',
      icon: Upload,
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Client meeting',
      description: 'Initial consultation with client to discuss case strategy',
      date: '2024-11-25',
      time: '11:00',
      icon: MessageSquare,
      iconColor: 'text-purple-600'
    },
    {
      id: 4,
      type: 'status_change',
      title: 'Status changed',
      description: 'Case status updated from Open to In Progress',
      date: '2024-11-20',
      time: '16:45',
      icon: CheckCircle,
      iconColor: 'text-yellow-600'
    },
    {
      id: 5,
      type: 'note',
      title: 'Case created',
      description: 'New case file created and initial documentation prepared',
      date: '2024-11-15',
      time: '10:00',
      icon: FileText,
      iconColor: 'text-gray-600'
    }
  ]);

  useEffect(() => {
    // Simulate API call
    const foundCase = mockCases.find(c => c.id === caseId);
    if (foundCase) {
      setCaseData(foundCase);
      const foundClient = mockClients.find(c => c.id === foundCase.clientId);
      if (foundClient) {
        setClient(foundClient);
      }
    }
    setLoading(false);
  }, [caseId]);

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
      id: Date.now(),
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case details...</p>
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
              <span>Back to Cases</span>
            </button>
          </div>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Case Not Found</h2>
            <p className="text-muted-foreground">The case you&apos;re looking for doesn&apos;t exist.</p>
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
            <span>Back to Cases</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{caseData.title}</h1>
            <p className="text-muted-foreground">Case Details</p>
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Case Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-foreground">{caseData.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-foreground">{caseData.clientName}</p>
                    <button
                      onClick={() => router.push(`/clients/${caseData.clientId}`)}
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
                    caseData.statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    caseData.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    caseData.statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {caseData.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                  <p className="text-foreground">{formatDate(caseData.createdDate)}</p>
                </div>
              </div>
            </div>
          </div>
          {caseData.notes && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
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
            onClick={() => router.push(`/clients/${caseData.clientId}`)}
            className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200 text-left"
          >
            <User className="w-8 h-8 text-primary" />
            <div>
              <h4 className="font-medium text-foreground">View Client</h4>
              <p className="text-sm text-muted-foreground">See client details and information</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200 text-left">
            <FolderOpen className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-medium text-foreground">Case Documents</h4>
              <p className="text-sm text-muted-foreground">View and manage case documents</p>
            </div>
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Case Timeline</h2>
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
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
              <h3 className="text-lg font-semibold text-foreground">Add Timeline Event</h3>
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
                  Event Type
                </label>
                <select
                  id="eventType"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as TimelineEvent['type'] }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                >
                  <option value="note">Note</option>
                  <option value="hearing">Hearing</option>
                  <option value="document">Document</option>
                  <option value="meeting">Meeting</option>
                  <option value="status_change">Status Change</option>
                </select>
              </div>

              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="eventTitle"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-foreground mb-1">
                  Description *
                </label>
                <textarea
                  id="eventDescription"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                  placeholder="Enter event description"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

