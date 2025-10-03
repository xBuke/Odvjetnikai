-- Add user_id columns to all tables for multitenancy
-- Run this SQL in your Supabase SQL Editor

-- Add user_id column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to billing table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing') THEN
        ALTER TABLE billing ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id column to calendar_events table
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
-- Create index for billing table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing') THEN
        CREATE INDEX IF NOT EXISTS idx_billing_user_id ON billing(user_id);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);

-- Update existing records to have a default user_id (you may want to set this to a specific user)
-- For now, we'll leave existing records without user_id (they'll be filtered out for new users)
-- UPDATE clients SET user_id = 'your-default-user-id' WHERE user_id IS NULL;
-- UPDATE cases SET user_id = 'your-default-user-id' WHERE user_id IS NULL;
-- UPDATE documents SET user_id = 'your-default-user-id' WHERE user_id IS NULL;
-- UPDATE billing SET user_id = 'your-default-user-id' WHERE user_id IS NULL;
-- UPDATE calendar_events SET user_id = 'your-default-user-id' WHERE user_id IS NULL;

-- Update RLS policies to include user_id filtering

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cases;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON documents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON billing;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON calendar_events;

-- Create new policies that filter by user_id

-- Clients policies
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Cases policies
CREATE POLICY "Users can view their own cases" ON cases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" ON cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" ON cases
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases" ON cases
    FOR DELETE USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);

-- Billing policies (if billing table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing') THEN
        -- Drop existing policies first for idempotency
        DROP POLICY IF EXISTS "Users can view their own billing" ON billing;
        DROP POLICY IF EXISTS "Users can insert their own billing" ON billing;
        DROP POLICY IF EXISTS "Users can update their own billing" ON billing;
        DROP POLICY IF EXISTS "Users can delete their own billing" ON billing;
        
        -- Create new policies
        CREATE POLICY "Users can view their own billing" ON billing
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own billing" ON billing
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own billing" ON billing
            FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own billing" ON billing
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Calendar events policies
CREATE POLICY "Users can view their own calendar events" ON calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" ON calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" ON calendar_events
    FOR DELETE USING (auth.uid() = user_id);
