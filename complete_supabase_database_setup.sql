-- ======================================================
-- Law Firm SaaS - Complete Supabase Database Setup
-- Run this entire script in Supabase SQL Editor
-- ======================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================================
-- ENUM TYPES
-- ======================================================

-- Create document_type enum
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

-- Create subscription_plan enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
        CREATE TYPE subscription_plan AS ENUM (
            'basic',
            'premium', 
            'enterprise',
            'PRO'
        );
    END IF;
END $$;

-- Create subscription_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'inactive',
            'trial',
            'active',
            'trialing',
            'past_due',
            'canceled',
            'unpaid'
        );
    END IF;
END $$;

-- Create case_status enum (for timeline progression)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status') THEN
        CREATE TYPE case_status AS ENUM (
            'Zaprimanje',
            'Priprema',
            'Ročište',
            'Presuda'
        );
    END IF;
END $$;

-- Create case_status_type enum (for general status)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status_type') THEN
        CREATE TYPE case_status_type AS ENUM (
            'Open',
            'In Progress',
            'Closed'
        );
    END IF;
END $$;

-- Create billing_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_status') THEN
        CREATE TYPE billing_status AS ENUM (
            'pending',
            'paid',
            'overdue',
            'sent'
        );
    END IF;
END $$;

-- ======================================================
-- TABLES
-- ======================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    username VARCHAR(255),
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_plan subscription_plan DEFAULT 'basic',
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    trial_limit INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing profiles table if they don't exist
DO $$
BEGIN
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status subscription_status DEFAULT 'inactive';
    END IF;

    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_plan'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_plan subscription_plan DEFAULT 'basic';
    END IF;

    -- Add trial_expires_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_expires_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add trial_limit column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_limit'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN trial_limit INTEGER DEFAULT 20;
    END IF;

    -- Add email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email VARCHAR(255);
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN full_name VARCHAR(255);
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;

    -- Add username column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'username'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username VARCHAR(255);
    END IF;
END $$;

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

-- Add missing columns to existing clients table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Add email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Add phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN phone VARCHAR(50) NOT NULL DEFAULT '';
    END IF;

    -- Add oib column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'oib'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN oib VARCHAR(11) NOT NULL DEFAULT '';
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    status case_status_type DEFAULT 'Open',
    case_type VARCHAR(100),
    case_status case_status DEFAULT 'Zaprimanje',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing cases table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'client_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN notes TEXT;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN status case_status_type DEFAULT 'Open';
    END IF;

    -- Add case_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'case_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN case_type VARCHAR(100);
    END IF;

    -- Add case_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'case_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN case_status case_status DEFAULT 'Zaprimanje';
    END IF;

    -- Add start_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'start_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN start_date DATE;
    END IF;

    -- Add end_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'end_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN end_date DATE;
    END IF;
END $$;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    type document_type,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing documents table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add case_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'case_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE CASCADE;
    END IF;

    -- Add name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Add file_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'file_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN file_url VARCHAR(500);
    END IF;

    -- Add file_size column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'file_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN file_size BIGINT;
    END IF;

    -- Add file_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'file_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN file_type VARCHAR(100);
    END IF;

    -- Add type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN type document_type;
    END IF;

    -- Add uploaded_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'uploaded_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create billing table
CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    billing_date DATE DEFAULT CURRENT_DATE,
    status billing_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing billing table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' 
        AND column_name = 'client_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
    END IF;

    -- Add case_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' 
        AND column_name = 'case_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE SET NULL;
    END IF;

    -- Add amount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' 
        AND column_name = 'amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing ADD COLUMN amount DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing ADD COLUMN description TEXT;
    END IF;

    -- Add billing_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' 
        AND column_name = 'billing_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing ADD COLUMN billing_date DATE DEFAULT CURRENT_DATE;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing ADD COLUMN status billing_status DEFAULT 'pending';
    END IF;
END $$;

-- Create billing_entries table for time tracking and billing
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

-- Add missing columns to existing billing_entries table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing_entries' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing_entries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing_entries' 
        AND column_name = 'client_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing_entries ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
    END IF;

    -- Add case_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing_entries' 
        AND column_name = 'case_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing_entries ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE SET NULL;
    END IF;

    -- Add hours column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing_entries' 
        AND column_name = 'hours'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing_entries ADD COLUMN hours DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;

    -- Add rate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing_entries' 
        AND column_name = 'rate'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing_entries ADD COLUMN rate DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing_entries' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.billing_entries ADD COLUMN notes TEXT;
    END IF;
END $$;

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

-- Add missing columns to existing calendar_events table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'client_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
    END IF;

    -- Add case_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'case_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE SET NULL;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN description TEXT;
    END IF;

    -- Add start_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'start_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;

    -- Add end_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'end_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

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

-- Add missing columns to existing deadlines table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deadlines' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deadlines ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add case_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deadlines' 
        AND column_name = 'case_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deadlines ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE CASCADE;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deadlines' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deadlines ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Add due_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deadlines' 
        AND column_name = 'due_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deadlines ADD COLUMN due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Create user_preferences table for storing user-specific settings
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

-- Add missing columns to existing user_preferences table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add page column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'page'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN page VARCHAR(50) NOT NULL DEFAULT 'cases';
    END IF;

    -- Add sort_field column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'sort_field'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN sort_field VARCHAR(50) NOT NULL DEFAULT 'created_at';
    END IF;

    -- Add sort_direction column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'sort_direction'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN sort_direction VARCHAR(10) NOT NULL DEFAULT 'desc';
    END IF;
END $$;

-- ======================================================
-- INDEXES
-- ======================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_oib ON clients(oib);

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_case_status ON cases(case_status);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON billing(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_client_id ON billing(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_case_id ON billing(case_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_date ON billing(billing_date);

-- Billing entries indexes
CREATE INDEX IF NOT EXISTS idx_billing_entries_user_id ON billing_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_client_id ON billing_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_case_id ON billing_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_created_at ON billing_entries(created_at);

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);

-- Deadlines indexes
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_page ON user_preferences(page);

-- ======================================================
-- FUNCTIONS
-- ======================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record for new user with default values
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    role, 
    subscription_status,
    subscription_plan,
    trial_limit
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'inactive',  -- Default to inactive for new users
    'basic',     -- Default to basic plan
    20           -- Default trial limit
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert a default user preference record for the new user
  INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
  VALUES (NEW.id, 'cases', 'created_at', 'desc')
  ON CONFLICT (user_id, page) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT subscription_status FROM public.profiles WHERE id = user_id) IN ('active', 'trialing'),
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT subscription_status::text FROM public.profiles WHERE id = user_id),
      'inactive'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user subscription status
CREATE OR REPLACE FUNCTION update_user_subscription_status(
  user_id UUID,
  status TEXT,
  plan TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    subscription_status = status::subscription_status,
    subscription_plan = COALESCE(plan::subscription_plan, subscription_plan),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial for a user
CREATE OR REPLACE FUNCTION start_trial_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    subscription_status = 'trial',
    trial_expires_at = NOW() + INTERVAL '7 days',
    trial_limit = 20,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is on trial
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

-- Function to check if trial has expired
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

-- Function to get trial days left
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

-- Function to check trial entity limits
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
  SELECT subscription_status::text, trial_limit, trial_expires_at
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

-- ======================================================
-- TRIGGERS
-- ======================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers for updated_at timestamps
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

-- ======================================================
-- ROW LEVEL SECURITY (RLS)
-- ======================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- RLS POLICIES
-- ======================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Clients policies (with subscription and trial support)
DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
CREATE POLICY "Users can manage their own clients" ON clients
    FOR ALL USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Cases policies (with subscription and trial support)
DROP POLICY IF EXISTS "Users can manage their own cases" ON cases;
CREATE POLICY "Users can manage their own cases" ON cases
    FOR ALL USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Documents policies (with subscription and trial support)
DROP POLICY IF EXISTS "Users can manage their own documents" ON documents;
CREATE POLICY "Users can manage their own documents" ON documents
    FOR ALL USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Billing policies (with subscription and trial support)
DROP POLICY IF EXISTS "Users can manage their own billing" ON billing;
CREATE POLICY "Users can manage their own billing" ON billing
    FOR ALL USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Billing entries policies (with subscription and trial support)
DROP POLICY IF EXISTS "Users can manage their own billing entries" ON billing_entries;
CREATE POLICY "Users can manage their own billing entries" ON billing_entries
    FOR ALL USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Calendar events policies (with subscription and trial support)
DROP POLICY IF EXISTS "Users can manage their own calendar events" ON calendar_events;
CREATE POLICY "Users can manage their own calendar events" ON calendar_events
    FOR ALL USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- Deadlines policies (with subscription and trial support)
DROP POLICY IF EXISTS "Users can manage their own deadlines" ON deadlines;
CREATE POLICY "Users can manage their own deadlines" ON deadlines
    FOR ALL USING (
        auth.uid() = user_id AND (
            user_has_active_subscription(auth.uid()) OR 
            (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
        )
    );

-- User preferences policies (allow access even without subscription for basic settings)
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ======================================================
-- TRIAL LIMIT ENFORCEMENT TRIGGERS
-- ======================================================

-- Function to enforce trial limit for clients
CREATE OR REPLACE FUNCTION enforce_trial_limit_clients()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count current clients for this user
  SELECT COUNT(*) INTO current_count
  FROM public.clients
  WHERE user_id = NEW.user_id;

  -- Check trial limits
  PERFORM check_trial_entity_limit(NEW.user_id, 'clients', current_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enforce trial limit for cases
CREATE OR REPLACE FUNCTION enforce_trial_limit_cases()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count current cases for this user
  SELECT COUNT(*) INTO current_count
  FROM public.cases
  WHERE user_id = NEW.user_id;

  -- Check trial limits
  PERFORM check_trial_entity_limit(NEW.user_id, 'cases', current_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enforce trial limit for documents
CREATE OR REPLACE FUNCTION enforce_trial_limit_documents()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count current documents for this user
  SELECT COUNT(*) INTO current_count
  FROM public.documents
  WHERE user_id = NEW.user_id;

  -- Check trial limits
  PERFORM check_trial_entity_limit(NEW.user_id, 'documents', current_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trial limit triggers
DROP TRIGGER IF EXISTS trial_limit_clients_trigger ON public.clients;
CREATE TRIGGER trial_limit_clients_trigger
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION enforce_trial_limit_clients();

DROP TRIGGER IF EXISTS trial_limit_cases_trigger ON public.cases;
CREATE TRIGGER trial_limit_cases_trigger
  BEFORE INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION enforce_trial_limit_cases();

DROP TRIGGER IF EXISTS trial_limit_documents_trigger ON public.documents;
CREATE TRIGGER trial_limit_documents_trigger
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION enforce_trial_limit_documents();

-- ======================================================
-- PERMISSIONS
-- ======================================================

-- Grant necessary permissions to authenticated users
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_subscription_status(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION start_trial_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_on_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_expired(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_left(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_trial_entity_limit(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION enforce_trial_limit_clients() TO authenticated;
GRANT EXECUTE ON FUNCTION enforce_trial_limit_cases() TO authenticated;
GRANT EXECUTE ON FUNCTION enforce_trial_limit_documents() TO authenticated;

-- ======================================================
-- COMMENTS
-- ======================================================

-- Add comments to document the schema
COMMENT ON TABLE profiles IS 'User profiles with subscription and trial information';
COMMENT ON TABLE clients IS 'Client information for law firm cases';
COMMENT ON TABLE cases IS 'Legal cases with timeline progression tracking';
COMMENT ON TABLE documents IS 'Case documents with type classification';
COMMENT ON TABLE billing IS 'Billing records for clients and cases';
COMMENT ON TABLE billing_entries IS 'Time tracking entries for billing';
COMMENT ON TABLE calendar_events IS 'Calendar events linked to clients and cases';
COMMENT ON TABLE deadlines IS 'Case deadlines and important dates';
COMMENT ON TABLE user_preferences IS 'User-specific application preferences';

COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status: inactive, trial, active, trialing, past_due, canceled, unpaid';
COMMENT ON COLUMN profiles.subscription_plan IS 'Subscription plan: basic, premium, enterprise, PRO';
COMMENT ON COLUMN profiles.trial_expires_at IS 'Trial expiration timestamp';
COMMENT ON COLUMN profiles.trial_limit IS 'Maximum entities allowed during trial (default: 20)';

COMMENT ON COLUMN cases.status IS 'General case status: Open, In Progress, Closed';
COMMENT ON COLUMN cases.case_status IS 'Timeline status: Zaprimanje, Priprema, Ročište, Presuda';

COMMENT ON COLUMN documents.type IS 'Document type classification';
COMMENT ON COLUMN billing.status IS 'Billing status: pending, paid, overdue, sent';

-- ======================================================
-- COMPLETION MESSAGE
-- ======================================================

-- This script has successfully created:
-- ✅ All enum types (document_type, subscription_plan, subscription_status, case_status, case_status_type, billing_status)
-- ✅ All tables with proper foreign key relationships
-- ✅ All necessary indexes for performance
-- ✅ Row Level Security (RLS) enabled on all tables
-- ✅ Comprehensive RLS policies for user data isolation
-- ✅ Trial account support with limits and expiration
-- ✅ Subscription management functions
-- ✅ Automatic updated_at timestamp triggers
-- ✅ Trial limit enforcement triggers
-- ✅ Proper permissions for authenticated users
-- ✅ Default values for trial accounts (subscription_status='inactive', subscription_plan='basic', trial_limit=20)

-- The database is now ready for the Law Firm SaaS application!
