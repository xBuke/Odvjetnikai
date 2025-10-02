'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';

interface Case {
  id: number;
  title: string;
  clientName: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

interface Document {
  id: number;
  name: string;
  file_url: string;
  case_id: number | null;
  uploaded_at: string;
  file_size?: number;
  file_type?: string;
  cases?: {
    title: string;
  };
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
}

export default function DocumentsPage() {
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

  // Load cases from Supabase
  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*, clients(name)')
        .order('title', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform data to match Case interface
      const casesWithClient: Case[] = (data || []).map(caseItem => ({
        id: caseItem.id,
        title: caseItem.title,
        clientName: caseItem.clients?.name || 'Unknown Client',
        status: caseItem.status
      }));

      setCases(casesWithClient);
    } catch (err) {
      console.error('Error loading cases:', err);
      setError('Failed to load cases. Please try again.');
    }
  };

  // Load documents from Supabase
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('documents')
        .select('*, cases(title)')
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadCases(), loadDocuments()]);
    };
    loadData();
  }, []);

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
      const { error: insertError } = await supabase
        .from('documents')
        .insert([{
          name: uploadFormData.name,
          file_url: publicUrl,
          case_id: uploadFormData.caseId ? parseInt(uploadFormData.caseId) : null,
          file_size: selectedFile.size,
          file_type: selectedFile.type
        }]);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      // Reload documents and reset form
      await loadDocuments();
      setUploadFormData({ name: '', caseId: '', type: '' });
      setSelectedFile(null);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error('Error uploading file:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document. Please try again.';
      setError(errorMessage);
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
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .eq('id', document.id);

        if (deleteError) {
          console.error('Database deletion error:', deleteError);
          throw deleteError;
        }

        // Reload documents after deletion
        await loadDocuments();
      } catch (err) {
        console.error('Error deleting document:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete document. Please try again.';
        setError(errorMessage);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('clients.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('documents.case')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('documents.uploadedDate')}
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
                  <option value="Contract">{t('documents.contract')}</option>
                  <option value="Legal Document">{t('documents.legalDocument')}</option>
                  <option value="Draft Document">{t('documents.draftDocument')}</option>
                  <option value="Financial Document">{t('documents.financialDocument')}</option>
                  <option value="Correspondence">{t('documents.correspondence')}</option>
                  <option value="Evidence">{t('documents.evidence')}</option>
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
