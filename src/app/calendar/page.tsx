'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import { Plus, Loader2, AlertCircle, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormSelect, FormActions } from '../../components/ui/Form';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  selectWithUserId, 
  insertWithUserId, 
  updateWithUserId, 
  deleteWithUserId 
} from '@/lib/supabaseHelpers';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Case {
  id: string;
  title: string;
  client_id: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at?: string;
}

interface Deadline {
  id: string;
  title: string;
  case_id: string;
  due_date: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  cases?: {
    title: string;
  };
}

interface Event {
  id: string;
  title: string;
  case: string;
  start: Date;
  end: Date;
  deadlineId: string;
}

interface NewEvent {
  title: string;
  case_id: string;
  due_date: string;
  time: string;
}

export default function CalendarPage() {
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

  const [events, setEvents] = useState<Event[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    case_id: '',
    due_date: '',
    time: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  );

  // Load cases from Supabase
  const loadCases = useCallback(async () => {
    try {
      const data = await selectWithUserId(supabase, 'cases') as unknown as Case[];
      setCases(data || []);
    } catch (err) {
      console.error('Error loading cases:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cases. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    }
  }, [showToast]);

  // Load deadlines from Supabase with case information
  const loadDeadlines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await selectWithUserId(supabase, 'deadlines', {}, '*, cases(title)') as unknown as Deadline[];
      setDeadlines(data || []);

      // Transform deadlines to events for the calendar
      const calendarEvents: Event[] = (data || []).map(deadline => {
        const dueDate = new Date(deadline.due_date);
        const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        return {
          id: deadline.id,
          title: deadline.title,
          case: deadline.cases?.title || 'Unknown Case',
          start: dueDate,
          end: endDate,
          deadlineId: deadline.id
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error loading deadlines:', err);
      
      // Show more specific error message from Supabase
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deadlines. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri dohvaćanju podataka", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadCases(), loadDeadlines()]);
    };
    loadData();
  }, [user, loadCases, loadDeadlines]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    if (!newEvent.title || !newEvent.case_id || !newEvent.due_date || !newEvent.time) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Combine date and time
      const [hours, minutes] = newEvent.time.split(':').map(Number);
      const selectedDate = new Date(newEvent.due_date);
      selectedDate.setHours(hours, minutes);
      
      // Normalize date with toISOString as requested
      const isoDate = new Date(selectedDate).toISOString();

      if (editingDeadline) {
        // Update existing deadline
        await updateWithUserId(supabase, 'deadlines', 'id', editingDeadline.id, {
          title: newEvent.title,
          case_id: newEvent.case_id,
          due_date: isoDate,
          updated_at: new Date().toISOString()
        });
      } else {
        // Add new deadline with user_id
        await insertWithUserId(supabase, 'deadlines', {
          title: newEvent.title,
          case_id: newEvent.case_id,
          due_date: isoDate
        });
      }

      // Reload deadlines and reset form
      await loadDeadlines();
      setNewEvent({ title: '', case_id: '', due_date: '', time: '' });
      setEditingDeadline(null);
      setShowModal(false);
      showToast('✔ Rok uspješno spremljen', 'success');
    } catch (err) {
      console.error('Error saving deadline:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // Show more specific error message from Supabase
      const errorMessage = err instanceof Error ? err.message : 'Failed to save deadline. Please try again.';
      setError(errorMessage);
      showToast(errorMessage ?? "Greška pri spremanju", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    alert(`Event: ${event.title}\nCase: ${event.case}\nDate: ${event.start.toLocaleDateString("hr-HR")}`);
  };

  const handleEditDeadline = (deadline: Deadline) => {
    const dueDate = new Date(deadline.due_date);
    // Use local date to avoid timezone issues
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const hours = String(dueDate.getHours()).padStart(2, '0');
    const minutes = String(dueDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    setEditingDeadline(deadline);
    setNewEvent({
      title: deadline.title,
      case_id: deadline.case_id.toString(),
      due_date: dateStr,
      time: timeStr
    });
    setShowModal(true);
  };

  const handleDeleteDeadline = async (deadlineId: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (confirm('Are you sure you want to delete this deadline?')) {
      try {
        setError(null);
        await deleteWithUserId(supabase, 'deadlines', 'id', deadlineId);

        // Reload deadlines after deletion
        await loadDeadlines();
        showToast('✔ Rok uspješno obrisan', 'success');
      } catch (err) {
        console.error('Error deleting deadline:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        
        // Show more specific error message from Supabase
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete deadline. Please try again.';
        setError(errorMessage);
        showToast(errorMessage ?? "Greška pri spremanju", 'error');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDeadline(null);
    setNewEvent({ title: '', case_id: '', due_date: '', time: '' });
  };

  const eventStyleGetter = () => {
    const backgroundColor = '#3174ad';
    const borderColor = '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        borderColor,
      },
    };
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('calendar.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{t('calendar.addDeadline')}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* View Controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setView(Views.MONTH)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            view === Views.MONTH
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {t('calendar.month')}
        </button>
        <button
          onClick={() => setView(Views.WEEK)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            view === Views.WEEK
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {t('calendar.week')}
        </button>
        <button
          onClick={() => setView(Views.DAY)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            view === Views.DAY
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {t('calendar.day')}
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-2 sm:p-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">{t('calendar.loadingCalendar')}</p>
            </div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            defaultDate={defaultDate}
            scrollToTime={scrollToTime}
          />
        )}
      </div>

      {/* Upcoming Deadlines List */}
      <div className="mt-6 bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{t('calendar.upcomingDeadlines')}</h3>
        </div>
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-muted-foreground">{t('calendar.loadingDeadlines')}</p>
            </div>
          ) : deadlines.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">{t('calendar.noDeadlinesFound')}</h4>
              <p className="text-muted-foreground">{t('calendar.getStarted')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deadlines.slice(0, 10).map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{deadline.title}</h4>
                    <p className="text-sm text-muted-foreground">{deadline.cases?.title || 'Unknown Case'}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('dashboard.due')}: {new Date(deadline.due_date).toLocaleDateString("hr-HR")} {t('calendar.at')} {new Date(deadline.due_date).toLocaleTimeString("hr-HR", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditDeadline(deadline)}
                      className="text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors"
                      title="Edit deadline"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDeadline(deadline.id)}
                      className="text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10 transition-colors"
                      title="Delete deadline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Deadline Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingDeadline ? t('calendar.editDeadline') : t('calendar.addNewDeadline')}
        size="sm"
      >
        <form onSubmit={handleAddEvent} className="space-y-4">
          <FormField label={t('cases.caseTitle')} required>
            <FormInput
              name="title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder={t('calendar.enterDeadlineTitle')}
              required
            />
          </FormField>

          <FormField label={t('billing.case')} required>
            <FormSelect
              name="case_id"
              value={newEvent.case_id}
              onChange={(e) => setNewEvent({ ...newEvent, case_id: e.target.value })}
              required
            >
              <option value="">{t('calendar.selectCase')}</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label={t('calendar.dueDate')} required>
            <FormInput
              name="due_date"
              type="date"
              value={newEvent.due_date}
              onChange={(e) => setNewEvent({ ...newEvent, due_date: e.target.value })}
              required
            />
          </FormField>

          <FormField label={t('calendar.time')} required>
            <FormInput
              name="time"
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              required
            />
          </FormField>

          <FormActions
            onCancel={handleModalClose}
            onSubmit={() => {}}
            submitText={editingDeadline ? t('calendar.updateDeadline') : t('calendar.addDeadline')}
            isLoading={submitting}
          />
        </form>
      </Modal>
    </div>
  );
}
