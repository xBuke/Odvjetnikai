'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Download, 
  X,
  FileText,
  Upload,
  File,
  Calendar,
  User,
  FolderOpen,
  FileCheck
} from 'lucide-react';

interface Case {
  id: number;
  title: string;
  clientName: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

interface Document {
  id: number;
  name: string;
  caseId: number | null;
  caseTitle: string | null;
  uploadedDate: string;
  size: string;
  type: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
}

export default function DocumentsPage() {
  // Mock cases data (same as in cases page)
  const mockCases: Case[] = [
    {
      id: 1,
      title: 'Horvat protiv Zagrebačke banke - Spor ugovora',
      clientName: 'Marko Horvat',
      status: 'In Progress'
    },
    {
      id: 2,
      title: 'Novak - Trgovina nekretninama',
      clientName: 'Ana Novak',
      status: 'Open'
    },
    {
      id: 3,
      title: 'Kovačević - Obiteljsko pravo',
      clientName: 'Petar Kovačević',
      status: 'Closed'
    },
    {
      id: 4,
      title: 'Babić - Osnivanje tvrtke',
      clientName: 'Ivana Babić',
      status: 'In Progress'
    },
    {
      id: 5,
      title: 'Jurić - Zahtjev za patent',
      clientName: 'Tomislav Jurić',
      status: 'Open'
    }
  ];

  // Mock templates data
  const mockTemplates: Template[] = [
    {
      id: 1,
      name: 'Ugovor',
      description: 'Standardni predložak pravnog ugovora',
      category: 'Poslovno'
    },
    {
      id: 2,
      name: 'Punomoć',
      description: 'Predložak dokumenta punomoći',
      category: 'Pravno'
    }
  ];

  // Local state for documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: 'Ugovor o suradnji - Zagrebačka banka.pdf',
      caseId: 1,
      caseTitle: 'Horvat protiv Zagrebačke banke - Spor ugovora',
      uploadedDate: '2024-12-01',
      size: '2.4 MB',
      type: 'Ugovor'
    },
    {
      id: 2,
      name: 'Zahtjev za dozvolu za obavljanje djelatnosti.pdf',
      caseId: 4,
      caseTitle: 'Babić - Osnivanje tvrtke',
      uploadedDate: '2024-11-28',
      size: '1.8 MB',
      type: 'Pravni dokument'
    },
    {
      id: 3,
      name: 'Nacrt radnog ugovora.docx',
      caseId: null,
      caseTitle: null,
      uploadedDate: '2024-11-25',
      size: '856 KB',
      type: 'Nacrt dokumenta'
    },
    {
      id: 4,
      name: 'Financijski izvještaj 2024.xlsx',
      caseId: 2,
      caseTitle: 'Novak - Trgovina nekretninama',
      uploadedDate: '2024-11-20',
      size: '3.2 MB',
      type: 'Financijski dokument'
    }
  ]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    caseId: '',
    type: ''
  });

  // Handle upload form input changes
  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload simulation
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFormData.name.trim()) {
      alert('Please enter a document name');
      return;
    }

    const selectedCase = mockCases.find(c => c.id === parseInt(uploadFormData.caseId));
    
    const newDocument: Document = {
      id: Date.now(),
      name: uploadFormData.name,
      caseId: uploadFormData.caseId ? parseInt(uploadFormData.caseId) : null,
      caseTitle: selectedCase ? selectedCase.title : null,
      uploadedDate: new Date().toISOString().split('T')[0],
      size: '1.2 MB', // Mock size
      type: uploadFormData.type || 'Document'
    };

    setDocuments(prev => [...prev, newDocument]);
    
    // Reset form and close modal
    setUploadFormData({ name: '', caseId: '', type: '' });
    setIsUploadModalOpen(false);
  };

  // Handle download
  const handleDownload = (document: Document) => {
    // Mock download functionality
    console.log('Downloading:', document.name);
    alert(`Downloading ${document.name}`);
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

  // Handle modal close
  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    setUploadFormData({ name: '', caseId: '', type: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Documents</h2>
            <p className="text-muted-foreground">Manage your law firm's documents and templates.</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Documents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Uploaded Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-accent">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <Link 
                          href={`/documents/${document.id}`}
                          className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors duration-200"
                        >
                          {document.name}
                        </Link>
                        <div className="text-sm text-muted-foreground">{document.type} • {document.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {document.caseTitle ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <File className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="truncate max-w-xs">{document.caseTitle}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No case linked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {formatDate(document.uploadedDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDownload(document)}
                      className="flex items-center space-x-1 text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors duration-200"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
            <p className="text-muted-foreground">Get started by uploading your first document.</p>
          </div>
        )}
      </div>

      {/* Templates Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Templates</h3>
          <p className="text-sm text-muted-foreground mt-1">Pre-built document templates for common legal documents.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTemplates.map((template) => (
              <div key={template.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                      <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors duration-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Upload Document</h3>
              <button
                onClick={handleUploadModalClose}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={uploadFormData.name}
                  onChange={handleUploadInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label htmlFor="caseId" className="block text-sm font-medium text-foreground mb-1">
                  Link to Case
                </label>
                <select
                  id="caseId"
                  name="caseId"
                  value={uploadFormData.caseId}
                  onChange={handleUploadInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                >
                  <option value="">No case linked</option>
                  {mockCases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
                  Document Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={uploadFormData.type}
                  onChange={handleUploadInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                >
                  <option value="">Select type</option>
                  <option value="Contract">Contract</option>
                  <option value="Legal Document">Legal Document</option>
                  <option value="Draft Document">Draft Document</option>
                  <option value="Financial Document">Financial Document</option>
                  <option value="Correspondence">Correspondence</option>
                  <option value="Evidence">Evidence</option>
                </select>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Upload className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <p className="text-sm font-medium text-foreground">File Upload Simulation</p>
                    <p className="text-sm text-muted-foreground">This is a mock upload. In a real application, you would select and upload actual files.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleUploadModalClose}
                  className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
