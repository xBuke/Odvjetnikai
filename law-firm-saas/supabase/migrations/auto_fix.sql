-- =====================================================
-- Auto-Fix Migration: Complete Database Setup
-- Date: 2025-01-15
-- Description: Comprehensive migration to fix all database schema issues
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable storage extension
CREATE EXTENSION IF NOT EXISTS "storage";

-- =====================================================
-- 1. PROFILES TABLE SETUP
-- =====================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    username TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT DEFAULT 'basic',
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    trial_limit INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'username'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN username TEXT;
    END IF;

    -- Add trial_expires_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_expires_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add trial_limit column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_limit'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN trial_limit INTEGER DEFAULT 20;
    END IF;

    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;

    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_plan'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_plan TEXT DEFAULT 'basic';
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN full_name TEXT;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- =====================================================
-- 2. CORE TABLES SETUP (from database-setup.sql)
-- =====================================================

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    oib VARCHAR(11) NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Open',
    case_type VARCHAR(100),
    case_status VARCHAR(50) DEFAULT 'Zaprimanje',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    type VARCHAR(50),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    billing_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_entries table
CREATE TABLE IF NOT EXISTS billing_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    hours DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page VARCHAR(50) NOT NULL,
    sort_field VARCHAR(50) NOT NULL,
    sort_direction VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, page)
);

-- =====================================================
-- 3. DOCUMENT TYPE ENUM
-- =====================================================

-- Create document_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
            'ugovor', 
            'punomoc', 
            'tuzba', 
            'pravni_dokument', 
            'nacrt_dokumenta', 
            'financijski_dokument', 
            'korespondencija', 
            'dokazni_materijal'
        );
    END IF;
END $$;

-- Add type column to documents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents 
        ADD COLUMN type document_type;
    END IF;
END $$;

-- =====================================================
-- 4. INDEXES
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_oib ON clients(oib);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON billing(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_client_id ON billing(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_case_id ON billing(case_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_user_id ON billing_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_client_id ON billing_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_case_id ON billing_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_created_at ON billing_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_page ON user_preferences(page);

-- =====================================================
-- 5. ROW LEVEL SECURITY
-- =====================================================

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. FUNCTIONS
-- =====================================================

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record for new user with trial status
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    username,
    subscription_status,
    subscription_plan,
    trial_expires_at,
    trial_limit
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    'trial',  -- New users start with trial status
    'basic',  -- Default plan
    NOW() + INTERVAL '7 days',  -- Trial expires in 7 days
    20  -- Default trial limit
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert a default user preference record for the new user
  INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
  VALUES (NEW.id, 'cases', 'created_at', 'desc')
  ON CONFLICT (user_id, page) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user_has_active_subscription function
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND (
      subscription_status = 'active' 
      OR (
        subscription_status = 'trial' 
        AND trial_expires_at > NOW()
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trial-related functions
CREATE OR REPLACE FUNCTION is_user_on_trial(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT subscription_status FROM public.profiles WHERE id = user_id) = 'trial',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_trial_expired(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT trial_expires_at FROM public.profiles WHERE id = user_id) < NOW(),
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_trial_days_left(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      EXTRACT(DAY FROM (trial_expires_at - NOW()))::INTEGER,
      0
    )
    FROM public.profiles 
    WHERE id = user_id AND subscription_status = 'trial'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_trial_entity_limit(
  user_id UUID,
  entity_type TEXT,
  current_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  user_trial_limit INTEGER;
  user_subscription_status TEXT;
  user_trial_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user trial information
  SELECT subscription_status, trial_limit, trial_expires_at
  INTO user_subscription_status, user_trial_limit, user_trial_expires_at
  FROM public.profiles 
  WHERE id = user_id;

  -- If not on trial, allow creation
  IF user_subscription_status != 'trial' THEN
    RETURN true;
  END IF;

  -- If trial expired, block creation
  IF user_trial_expires_at < NOW() THEN
    RAISE EXCEPTION 'Trial expired';
  END IF;

  -- If trial limit reached, block creation
  IF current_count >= user_trial_limit THEN
    RAISE EXCEPTION 'Trial limit reached';
  END IF;

  -- Trial is active and limit not reached
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Create trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at triggers for all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_updated_at ON billing;
CREATE TRIGGER update_billing_updated_at
    BEFORE UPDATE ON billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_entries_updated_at ON billing_entries;
CREATE TRIGGER update_billing_entries_updated_at
    BEFORE UPDATE ON billing_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deadlines_updated_at ON deadlines;
CREATE TRIGGER update_deadlines_updated_at
    BEFORE UPDATE ON deadlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can insert their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can delete their own cases" ON public.cases;

DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view their own billing" ON public.billing;
DROP POLICY IF EXISTS "Users can insert their own billing" ON public.billing;
DROP POLICY IF EXISTS "Users can update their own billing" ON public.billing;
DROP POLICY IF EXISTS "Users can delete their own billing" ON public.billing;

DROP POLICY IF EXISTS "Users can view their own billing entries" ON public.billing_entries;
DROP POLICY IF EXISTS "Users can insert their own billing entries" ON public.billing_entries;
DROP POLICY IF EXISTS "Users can update their own billing entries" ON public.billing_entries;
DROP POLICY IF EXISTS "Users can delete their own billing entries" ON public.billing_entries;

DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;

DROP POLICY IF EXISTS "Users can view their own deadlines" ON public.deadlines;
DROP POLICY IF EXISTS "Users can insert their own deadlines" ON public.deadlines;
DROP POLICY IF EXISTS "Users can update their own deadlines" ON public.deadlines;
DROP POLICY IF EXISTS "Users can delete their own deadlines" ON public.deadlines;

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Create new policies with trial support
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can view their own clients" ON public.clients
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own clients" ON public.clients
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own clients" ON public.clients
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own clients" ON public.clients
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Cases policies
CREATE POLICY "Users can view their own cases" ON public.cases
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own cases" ON public.cases
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own cases" ON public.cases
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own cases" ON public.cases
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Documents policies
CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Billing policies
CREATE POLICY "Users can view their own billing" ON public.billing
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own billing" ON public.billing
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own billing" ON public.billing
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own billing" ON public.billing
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Billing entries policies
CREATE POLICY "Users can view their own billing entries" ON public.billing_entries
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own billing entries" ON public.billing_entries
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own billing entries" ON public.billing_entries
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own billing entries" ON public.billing_entries
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Calendar events policies
CREATE POLICY "Users can view their own calendar events" ON public.calendar_events
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own calendar events" ON public.calendar_events
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own calendar events" ON public.calendar_events
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own calendar events" ON public.calendar_events
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Deadlines policies
CREATE POLICY "Users can view their own deadlines" ON public.deadlines
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own deadlines" ON public.deadlines
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own deadlines" ON public.deadlines
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own deadlines" ON public.deadlines
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
    FOR DELETE USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- =====================================================
-- 9. STORAGE BUCKET SETUP
-- =====================================================

-- Create the documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket for security (files accessed via signed URLs)
  52428800, -- 50MB file size limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view documents in demo mode" ON storage.objects;

-- Create storage policies
CREATE POLICY "Authenticated users can upload their own documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid() = owner
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view their own documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete their own documents" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_on_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_expired(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_left(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_trial_entity_limit(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- =====================================================
-- 11. COMMENTS
-- =====================================================

-- Add comments to document the changes
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile with trial status, 7-day trial period, and all required fields';
COMMENT ON FUNCTION user_has_active_subscription(user_id UUID) IS 'Function to check if user has active subscription or valid trial period';
COMMENT ON FUNCTION check_trial_entity_limit(user_id UUID, entity_type TEXT, current_count INTEGER) IS 'Function to check trial entity limits before creation';

-- =====================================================
-- 12. VERIFICATION
-- =====================================================

-- Verification queries
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
        THEN 'SUCCESS: profiles table exists'
        ELSE 'ERROR: profiles table missing'
    END as profiles_table_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public')
        THEN 'SUCCESS: clients table exists'
        ELSE 'ERROR: clients table missing'
    END as clients_table_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases' AND table_schema = 'public')
        THEN 'SUCCESS: cases table exists'
        ELSE 'ERROR: cases table missing'
    END as cases_table_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public')
        THEN 'SUCCESS: documents table exists'
        ELSE 'ERROR: documents table missing'
    END as documents_table_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing' AND table_schema = 'public')
        THEN 'SUCCESS: billing table exists'
        ELSE 'ERROR: billing table missing'
    END as billing_table_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_entries' AND table_schema = 'public')
        THEN 'SUCCESS: billing_entries table exists'
        ELSE 'ERROR: billing_entries table missing'
    END as billing_entries_table_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences' AND table_schema = 'public')
        THEN 'SUCCESS: user_preferences table exists'
        ELSE 'ERROR: user_preferences table missing'
    END as user_preferences_table_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents')
        THEN 'SUCCESS: documents storage bucket exists'
        ELSE 'ERROR: documents storage bucket missing'
    END as storage_bucket_check;
