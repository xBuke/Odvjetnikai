'use client';

import { useState } from 'react';
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
  XCircle
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormTextarea, FormSelect, FormActions } from '../../components/ui/Form';

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

export default function CasesPage() {
  const router = useRouter();
  
  // Mock clients data (same as in clients page)
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

  // Mock initial cases data
  const [cases, setCases] = useState<Case[]>([
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
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    status: 'Open' as 'Open' | 'In Progress' | 'Closed',
    notes: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedClient = mockClients.find(client => client.id === parseInt(formData.clientId));
    if (!selectedClient) return;

    const statusColors = {
      'Open': 'blue' as const,
      'In Progress': 'yellow' as const,
      'Closed': 'green' as const
    };

    if (editingCase) {
      // Update existing case
      setCases(prev => prev.map(caseItem =>
        caseItem.id === editingCase.id
          ? { 
              ...caseItem, 
              title: formData.title,
              clientId: parseInt(formData.clientId),
              clientName: selectedClient.name,
              status: formData.status,
              statusColor: statusColors[formData.status],
              notes: formData.notes
            }
          : caseItem
      ));
    } else {
      // Add new case
      const newCase: Case = {
        id: Date.now(), // Simple ID generation
        title: formData.title,
        clientId: parseInt(formData.clientId),
        clientName: selectedClient.name,
        status: formData.status,
        statusColor: statusColors[formData.status],
        createdDate: new Date().toISOString().split('T')[0],
        notes: formData.notes
      };
      setCases(prev => [...prev, newCase]);
    }

    // Reset form and close modal
    setFormData({ title: '', clientId: '', status: 'Open', notes: '' });
    setEditingCase(null);
    setIsModalOpen(false);
  };

  // Handle edit button click
  const handleEdit = (caseItem: Case) => {
    setEditingCase(caseItem);
    setFormData({
      title: caseItem.title,
      clientId: caseItem.clientId.toString(),
      status: caseItem.status,
      notes: caseItem.notes
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = (caseId: number) => {
    if (confirm('Are you sure you want to delete this case?')) {
      setCases(prev => prev.filter(caseItem => caseItem.id !== caseId));
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCase(null);
    setFormData({ title: '', clientId: '', status: 'Open', notes: '' });
  };

  // Handle row click to navigate to case detail
  const handleRowClick = (caseId: number) => {
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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Cases</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your law firm&apos;s legal cases and matters.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Case</span>
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Linked Client
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Created Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
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
                      {formatDate(caseItem.createdDate)}
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

        {cases.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No cases found</h3>
            <p className="text-muted-foreground">Get started by adding your first case.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Case Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCase ? 'Edit Case' : 'Add New Case'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Case Title" required>
            <FormInput
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter case title"
              required
            />
          </FormField>

          <FormField label="Client" required>
            <FormSelect
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a client</option>
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label="Status" required>
            <FormSelect
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </FormSelect>
          </FormField>

          <FormField label="Notes">
            <FormTextarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter case notes and details"
            />
          </FormField>

          <FormActions
            onCancel={handleModalClose}
            onSubmit={() => {}}
            submitText={editingCase ? 'Update Case' : 'Add Case'}       
          />
        </form>
      </Modal>
    </div>
  );
}
