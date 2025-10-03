'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Download, 
  X,
  FileText,
  File,
  Calendar,
  FolderOpen,
  FileCheck,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { 
  selectWithUserId, 
  selectWithUserIdAndOrder,
  insertWithUserId, 
  deleteWithUserId,
  getUserOrThrow
} from '@/lib/supabaseHelpers';
import { getDocumentTypeOptions, getDocumentLabel, type DocumentType } from '@/lib/documentTypes';
import { useUserPreferences, SortField, SortDirection } from '@/lib/userPreferences';

interface Case {
  id: string;
  title: string;
  clientName: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  case_id: string | null;
  uploaded_at: string;
  file_size?: number;
  file_type?: string;
  type?: DocumentType;
  cases?: {
    title: string;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

// TypeScript interfaces for sorting
type DocumentsSortField = 'name' | 'type' | 'case_title' | 'created_at' | 'updated_at';

export default function DocumentsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
    // Fallback function if context is not available
    t = (key: string) => key;
  }

  // State management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting state with Supabase persistence
  const [sortField, setSortField] = useState<DocumentsSortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Use shared user preferences utility
  const { loadPreferences, savePreferences } = useUserPreferences('documents', showToast);

  // Mock templates data
  const mockTemplates: Template[] = [
    {
      id: 'template-1-uuid-1234-5678-9abc-def012345678',
      name: 'Ugovor',
      description: 'Standardni predložak pravnog ugovora',
      category: 'Poslovno'
    },
    {
      id: 'template-2-uuid-2345-6789-abcd-ef0123456789',
      name: 'Punomoć',
      description: 'Predložak dokumenta punomoći',
      category: 'Pravno'
    }
  ];

  // Load cases from Supabase
  const loadCases = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await selectWithUserId(supabase, 'cases', {}, '*, clients(name)') as unknown as Record<string, unknown>[];

      // Transform data to match Case interface
      const casesWithClient: Case[] = (data || []).map(caseItem => ({
        id: caseItem.id as string,
        title: caseItem.title as string,
        clientName: (caseItem.clients as Record<string, unknown>)?.name as string || 'Unknown Client',
        status: caseItem.status as string
      } as Case));

      setCases(casesWithClient);
    } catch (err) {
      console.error('Error loading cases:', err);
      
      // Show more specific error message from Supabase
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cases. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    }
  }, [user, showToast]);

  // Load user preferences from Supabase
  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = await loadPreferences();
      setSortField(preferences.sortField as DocumentsSortField);
      setSortDirection(preferences.sortDirection);
    } catch (err) {
      console.error('Error loading user preferences:', err);
    } finally {
      setPreferencesLoaded(true);
    }
  }, [loadPreferences]);

  // Load documents from Supabase with sorting
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map frontend sort field to database column
      const getSortColumn = (field: DocumentsSortField) => {
        switch (field) {
          case 'case_title':
            return 'cases.title'; // This won't work directly, we'll handle case sorting differently
          case 'name':
            return 'name';
          case 'type':
            return 'type';
          case 'created_at':
            return 'created_at';
          case 'updated_at':
            return 'updated_at';
          default:
            return 'created_at';
        }
      };

      const sortColumn = getSortColumn(sortField);
      const orderBy = {
        column: sortColumn,
        ascending: sortDirection === 'asc'
      };

      // For case title sorting, we need to handle it differently since it's a joined field
      let data: Document[];
      
      if (sortField === 'case_title') {
        // For case title sorting, we'll fetch all data and sort in JavaScript
        data = await selectWithUserId(supabase, 'documents', {}, '*, cases(title)') as unknown as Document[];
        
        // Sort by case title in JavaScript
        data.sort((a, b) => {
          const aTitle = a.cases?.title || '';
          const bTitle = b.cases?.title || '';
          const comparison = aTitle.localeCompare(bTitle);
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      } else {
        // For other fields, use database sorting
        data = await selectWithUserIdAndOrder(supabase, 'documents', {}, '*, cases(title)', orderBy) as unknown as Document[];
      }
      
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      
      // Show more specific error message from Supabase
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, sortField, sortDirection]);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        // First load user preferences, then load cases and documents
        await loadUserPreferences();
        await Promise.all([loadCases(), loadDocuments()]);
      };
      loadData();
    }
  }, [user, loadUserPreferences, loadCases, loadDocuments]);

  // Load documents when preferences are loaded and sorting changes
  useEffect(() => {
    if (preferencesLoaded && user) {
      loadDocuments();
    }
  }, [preferencesLoaded, sortField, sortDirection, loadDocuments, user]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    caseId: '',
    type: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle upload form input changes
  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill document name if not already set
      if (!uploadFormData.name) {
        setUploadFormData(prev => ({
          ...prev,
          name: file.name
        }));
      }
    }
  };

  // Handle file upload to Supabase
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    if (!uploadFormData.name.trim()) {
      alert('Please enter a document name');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Please check your environment variables.');
      }

      // Get current user (will throw if not authenticated)
      await getUserOrThrow(supabase);

      // First, check if the storage bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        throw new Error('Unable to access storage. Please check your Supabase configuration.');
      }

      const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
      
      if (!documentsBucket) {
        throw new Error('Storage bucket "documents" not found. Please create it in your Supabase dashboard under Storage.');
      }

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`docs/${fileName}`, selectedFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(`docs/${fileName}`);

      // Insert metadata into documents table
      await insertWithUserId(supabase, 'documents', {
        name: uploadFormData.name,
        file_url: publicUrl,
        case_id: uploadFormData.caseId || null,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        type: uploadFormData.type || null
      });

      // Reload documents and reset form
      await loadDocuments();
      setUploadFormData({ name: '', caseId: '', type: '' });
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      showToast('Dokument uspješno spremljen', 'success');
    } catch (err) {
      console.error('Error uploading file:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // Show more specific error message from Supabase
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri spremanju", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle download
  const handleDownload = (document: Document) => {
    // Open file URL in new tab for download
    window.open(document.file_url, '_blank');
  };

  // Handle delete document
  const handleDelete = async (document: Document) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        setError(null);

        // Check if Supabase is properly configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Supabase configuration missing. Please check your environment variables.');
        }

        // Extract file path from URL for storage deletion
        const urlParts = document.file_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `docs/${fileName}`;

        // Try to delete from Supabase Storage (only if bucket exists)
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
          
          if (documentsBucket) {
            const { error: storageError } = await supabase.storage
              .from('documents')
              .remove([filePath]);

            if (storageError) {
              console.warn('Storage deletion error:', storageError);
              // Continue with metadata deletion even if storage deletion fails
            }
          }
        } catch (storageErr) {
          console.warn('Could not delete from storage:', storageErr);
          // Continue with metadata deletion
        }

        // Delete metadata from database
        await deleteWithUserId(supabase, 'documents', 'id', document.id);

        // Reload documents after deletion
        await loadDocuments();
        showToast('Dokument uspješno obrisan', 'success');
      } catch (err) {
        console.error('Error deleting document:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        
        // Show more specific error message from Supabase
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete document. Please try again.';
        setError(errorMessage);
        showToast(errorMessage ?? "Greška pri spremanju", 'error');
      }
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

  // Handle modal close
  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    setUploadFormData({ name: '', caseId: '', type: '' });
    setSelectedFile(null);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle sorting
  const handleSort = async (field: DocumentsSortField) => {
    let newField = field;
    let newDirection: SortDirection;

    if (sortField === field) {
      // Toggle direction if same field
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field with default direction
      newField = field;
      newDirection = 'asc';
    }

    // Update state
    setSortField(newField);
    setSortDirection(newDirection);

    // Save preferences to Supabase
    await savePreferences(newField, newDirection);
  };

  // Get sort icon for column headers
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-primary" /> : 
      <ArrowDown className="w-4 h-4 text-primary" />;
  };

  // Map document type enum values to user-friendly labels
  const getDocumentTypeLabel = (type?: DocumentType) => {
    if (!type) return t('documents.unknownType');
    return getDocumentLabel(type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('documents.title')}</h2>
            <p className="text-muted-foreground">{t('documents.subtitle')}</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>{t('documents.uploadDocument')}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-foreground">
              Sort by:
            </label>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={async (e) => {
                const [field, direction] = e.target.value.split('-');
                const newField = field as DocumentsSortField;
                const newDirection = direction as SortDirection;
                setSortField(newField);
                setSortDirection(newDirection);
                await savePreferences(newField, newDirection);
              }}
              className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="created_at-desc">Datum kreiranja (najnoviji)</option>
              <option value="created_at-asc">Datum kreiranja (najstariji)</option>
              <option value="updated_at-desc">Datum ažuriranja (najnoviji)</option>
              <option value="updated_at-asc">Datum ažuriranja (najstariji)</option>
              <option value="name-asc">Naziv dokumenta (A-Z)</option>
              <option value="name-desc">Naziv dokumenta (Z-A)</option>
              <option value="type-asc">Tip dokumenta (A-Z)</option>
              <option value="type-desc">Tip dokumenta (Z-A)</option>
              <option value="case_title-asc">Predmet (A-Z)</option>
              <option value="case_title-desc">Predmet (Z-A)</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            {documents.length} dokumenata
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{t('documents.title')}</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">{t('documents.loadingDocuments')}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('documents.noDocumentsFound')}</h3>
            <p className="text-muted-foreground">{t('documents.getStarted')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('clients.name')}</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('documents.documentType')}</span>
                      {getSortIcon('type')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('case_title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('documents.case')}</span>
                      {getSortIcon('case_title')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{t('documents.uploadedDate')}</span>
                      {getSortIcon('created_at')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('common.actions')}
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
                          <div className="text-sm text-muted-foreground">
                            {document.file_type || t('documents.unknownType')} • {formatFileSize(document.file_size)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {getDocumentTypeLabel(document.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {document.cases?.title ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <File className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="truncate max-w-xs">{document.cases.title}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">{t('documents.noCaseLinked')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        {formatDate(document.uploaded_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(document)}
                          className="flex items-center space-x-1 text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors duration-200"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                            <span>{t('documents.download')}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(document)}
                          className="flex items-center space-x-1 text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10 transition-colors duration-200"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                            <span>{t('documents.delete')}</span>
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

      {/* Templates Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{t('documents.templates')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('documents.templatesSubtitle')}</p>
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
                      <h3 className="text-lg font-semibold text-foreground">{t('documents.uploadDocument')}</h3>
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
                  {t('documents.documentName')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={uploadFormData.name}
                  onChange={handleUploadInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                  placeholder={t('documents.enterDocumentName')}
                />
              </div>

              <div>
                <label htmlFor="caseId" className="block text-sm font-medium text-foreground mb-1">
                  {t('documents.linkToCase')}
                </label>
                <select
                  id="caseId"
                  name="caseId"
                  value={uploadFormData.caseId}
                  onChange={handleUploadInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                >
                  <option value="">{t('documents.noCaseLinked')}</option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
                  {t('documents.documentType')}
                </label>
                <select
                  id="type"
                  name="type"
                  value={uploadFormData.type}
                  onChange={handleUploadInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                >
                  <option value="">{t('documents.selectType')}</option>
                  {getDocumentTypeOptions().map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-foreground mb-1">
                  {t('documents.selectFile')} *
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.png,.jpg,.jpeg"
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>{t('documents.selected')}:</strong> {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('documents.size')}: {formatFileSize(selectedFile.size)} • {t('documents.type')}: {selectedFile.type}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleUploadModalClose}
                  className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? t('documents.uploading') : t('documents.uploadDocument')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
