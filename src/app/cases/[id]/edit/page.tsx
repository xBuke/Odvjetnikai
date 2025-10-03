'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { selectSingleWithUserId, updateWithUserId } from '@/lib/supabaseHelpers';

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

export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const { } = useAuth();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    status: 'Open' as 'Open' | 'In Progress' | 'Closed'
  });

  // Load case data from Supabase
  const loadCaseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch case with client information from Supabase
      const caseData = await selectSingleWithUserId(supabase, 'cases', 'id', caseId, '*, clients(name, email, phone, oib, notes)') as unknown as Case;
      setCaseData(caseData);
      
      // Populate form with existing data
      setFormData({
        title: caseData.title || '',
        notes: caseData.notes || '',
        status: caseData.status || 'Open'
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Naziv predmeta je obavezan.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update case in Supabase - only send fields that user can edit
      await updateWithUserId(supabase, 'cases', 'id', caseId, {
        title: formData.title.trim(),
        notes: formData.notes.trim(),
        status: formData.status
        // updated_at will be automatically set by database trigger
      });

      // Redirect back to case details
      router.push(`/cases/${caseId}`);
    } catch (err) {
      console.error('Error updating case:', err);
      setError('Greška pri spremanju promjena. Molimo pokušajte ponovno.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/cases/${caseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Učitavanje predmeta...</p>
        </div>
      </div>
    );
  }

  if (error && !caseData) {
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
            onClick={() => router.push(`/cases/${caseId}`)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Natrag na predmet</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Uredi predmet</h1>
            <p className="text-muted-foreground">Ažuriraj informacije o predmetu</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Informacije o predmetu</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Naziv predmeta *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                placeholder="Unesite naziv predmeta"
              />
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
              >
                <option value="Open">Otvoren</option>
                <option value="In Progress">U tijeku</option>
                <option value="Closed">Zatvoren</option>
              </select>
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                Bilješke
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                placeholder="Unesite bilješke o predmetu"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                disabled={saving}
              >
                Odustani
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Spremanje...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Spremi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
