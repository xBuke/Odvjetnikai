'use client';

import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Plus } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FormField, FormInput, FormSelect, FormActions } from '../../components/ui/Form';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Mock cases data
const mockCases = [
  { id: 1, title: 'Smith vs. Johnson Contract Dispute' },
  { id: 2, title: 'Brown Estate Planning' },
  { id: 3, title: 'Davis Employment Law Case' },
  { id: 4, title: 'Wilson Personal Injury Claim' },
  { id: 5, title: 'Miller Corporate Merger' },
];

// Mock events data
const initialEvents = [
  {
    id: 1,
    title: 'Contract Review Deadline',
    case: 'Smith vs. Johnson Contract Dispute',
    start: new Date(2024, 11, 15, 10, 0),
    end: new Date(2024, 11, 15, 11, 0),
  },
  {
    id: 2,
    title: 'Court Filing Due',
    case: 'Brown Estate Planning',
    start: new Date(2024, 11, 18, 14, 0),
    end: new Date(2024, 11, 18, 15, 0),
  },
  {
    id: 3,
    title: 'Client Meeting',
    case: 'Davis Employment Law Case',
    start: new Date(2024, 11, 20, 9, 0),
    end: new Date(2024, 11, 20, 10, 0),
  },
  {
    id: 4,
    title: 'Document Submission',
    case: 'Wilson Personal Injury Claim',
    start: new Date(2024, 11, 22, 16, 0),
    end: new Date(2024, 11, 22, 17, 0),
  },
];

const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  case: string;
  start: Date;
  end: Date;
}

interface NewEvent {
  title: string;
  case: string;
  date: string;
  time: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    case: '',
    date: '',
    time: '',
  });

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  );

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.case || !newEvent.date || !newEvent.time) {
      alert('Please fill in all fields');
      return;
    }

    const [hours, minutes] = newEvent.time.split(':').map(Number);
    const eventDate = new Date(newEvent.date);
    eventDate.setHours(hours, minutes);

    const event: Event = {
      id: events.length + 1,
      title: newEvent.title,
      case: newEvent.case,
      start: eventDate,
      end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', case: '', date: '', time: '' });
    setShowModal(false);
  };

  const handleSelectEvent = (event: Event) => {
    alert(`Event: ${event.title}\nCase: ${event.case}\nDate: ${event.start.toLocaleDateString()}`);
  };

  const eventStyleGetter = (event: Event) => {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Calendar</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Deadline</span>
        </button>
      </div>

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
          Month
        </button>
        <button
          onClick={() => setView(Views.WEEK)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            view === Views.WEEK
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setView(Views.DAY)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            view === Views.DAY
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Day
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-2 sm:p-4">
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
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Deadline"
        size="sm"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-4">
          <FormField label="Title" required>
            <FormInput
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Enter deadline title"
              required
            />
          </FormField>

          <FormField label="Case" required>
            <FormSelect
              value={newEvent.case}
              onChange={(e) => setNewEvent({ ...newEvent, case: e.target.value })}
              required
            >
              <option value="">Select a case</option>
              {mockCases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.title}>
                  {caseItem.title}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label="Date" required>
            <FormInput
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Time" required>
            <FormInput
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              required
            />
          </FormField>

          <FormActions
            onCancel={() => setShowModal(false)}
            onSubmit={handleAddEvent}
            submitText="Add Deadline"
          />
        </form>
      </Modal>
    </div>
  );
}
