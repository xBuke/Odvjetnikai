// Database types based on the schema
export type CaseStatus = 
  | 'Zaprimanje'
  | 'Priprema'
  | 'Ročište'
  | 'Presuda';

export type CaseStatusType = 
  | 'Open'
  | 'In Progress'
  | 'Closed';

// Database interface for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
      };
      cases: {
        Row: Case;
        Insert: Omit<Case, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Case, 'id' | 'created_at' | 'updated_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>;
      };
      billing_entries: {
        Row: BillingEntry;
        Insert: Omit<BillingEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BillingEntry, 'id' | 'created_at' | 'updated_at'>>;
      };
      billing: {
        Row: Billing;
        Insert: Omit<Billing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Billing, 'id' | 'created_at' | 'updated_at'>>;
      };
      calendar_events: {
        Row: CalendarEvent;
        Insert: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>>;
      };
      deadlines: {
        Row: Deadline;
        Insert: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Deadline, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_preferences: {
        Row: UserPreference;
        Insert: Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

export type DocumentType = 
  | 'ugovor'
  | 'punomoc'
  | 'tuzba'
  | 'pravni_dokument'
  | 'nacrt_dokumenta'
  | 'financijski_dokument'
  | 'korespondencija'
  | 'dokazni_materijal';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  oib: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  notes?: string;
  status: CaseStatusType;
  case_type?: string;
  case_status: CaseStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  case_id: string;
  name: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  type?: DocumentType;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface BillingEntry {
  id: string;
  user_id: string;
  client_id: string;
  case_id?: string;
  hours: number;
  rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Billing {
  id: string;
  user_id: string;
  client_id: string;
  case_id?: string;
  amount: number;
  description?: string;
  billing_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  username?: string;
  subscription_status: string;
  subscription_plan: string;
  trial_expires_at?: string;
  trial_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  client_id?: string;
  case_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  user_id: string;
  title: string;
  case_id: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  page: string;
  sort_field: string;
  sort_direction: string;
  created_at: string;
  updated_at: string;
}
