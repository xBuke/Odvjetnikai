'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormTextarea, FormActions } from '../../components/ui/Form';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  oib: string;
  notes: string;
}

export default function ClientsPage() {
  const router = useRouter();
  
  // Mock initial data
  const [clients, setClients] = useState<Client[]>([
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
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    oib: '',
    notes: ''
  });

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.oib.includes(searchTerm)
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      // Update existing client
      setClients(prev => prev.map(client =>
        client.id === editingClient.id
          ? { ...client, ...formData }
          : client
      ));
    } else {
      // Add new client
      const newClient: Client = {
        id: Date.now(), // Simple ID generation
        ...formData
      };
      setClients(prev => [...prev, newClient]);
    }

    // Reset form and close modal
    setFormData({ name: '', email: '', phone: '', oib: '', notes: '' });
    setEditingClient(null);
    setIsModalOpen(false);
  };

  // Handle edit button click
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      oib: client.oib,
      notes: client.notes
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = (clientId: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setClients(prev => prev.filter(client => client.id !== clientId));
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', oib: '', notes: '' });
  };

  // Handle row click to navigate to client detail
  const handleRowClick = (clientId: number) => {
    router.push(`/clients/${clientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Clients</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your law firm&apos;s client database.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or OIB..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Phone
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  OIB
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Notes
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredClients.map((client, index) => (
                <tr 
                  key={client.id} 
                  className={`hover:bg-accent cursor-pointer transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                  }`}
                  onClick={() => handleRowClick(client.id)}
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-sm font-medium text-foreground">{client.name}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      {client.email}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground hidden lg:table-cell">
                    {client.oib}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-muted-foreground max-w-xs truncate hidden lg:table-cell">
                    {client.notes}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div 
                      className="flex items-center space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors duration-200"
                        title="Edit client"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10 transition-colors duration-200"
                        title="Delete client"
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

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No clients found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first client.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required>
            <FormInput
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter client name"
              required
            />
          </FormField>

          <FormField label="Email" required>
            <FormInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
            />
          </FormField>

          <FormField label="Phone" required>
            <FormInput
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
            />
          </FormField>

          <FormField label="OIB" required>
            <FormInput
              name="oib"
              value={formData.oib}
              onChange={handleInputChange}
              maxLength={11}
              placeholder="Enter OIB (11 digits)"
              required
            />
          </FormField>

          <FormField label="Notes">
            <FormTextarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter any additional notes"
            />
          </FormField>

          <FormActions
            onCancel={handleModalClose}
            onSubmit={() => {}}
            submitText={editingClient ? 'Update Client' : 'Add Client'} 
          />
        </form>
      </Modal>
    </div>
  );
}
