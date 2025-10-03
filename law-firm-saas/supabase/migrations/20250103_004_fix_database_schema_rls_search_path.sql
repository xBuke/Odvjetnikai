-- Migration: Fix database schema, RLS, and search_path issues
-- Created: 2025-01-03
-- Description: Comprehensive fix for database schema, Row Level Security, and function search_path issues

-- 1. Add missing created_at column to documents table if it doesn't exist
-- The documents table already has created_at in the main schema, but let's ensure it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.documents 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 2. Ensure documents storage bucket exists (idempotent)
-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true, -- Public bucket for easy file access
  52428800, -- 50MB file size limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security on user_preferences table (idempotent)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS policies for user_preferences (idempotent)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Update functions with proper search_path (idempotent)

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a default user preference record for the new user
    INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
    VALUES (NEW.id, 'cases', 'created_at', 'desc')
    ON CONFLICT (user_id, page) DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Update update_billing_updated_at function
CREATE OR REPLACE FUNCTION update_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Update update_user_preferences_updated_at function
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Update update_updated_at_column function (used by other tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- 6. Ensure all triggers are properly set up (idempotent)

-- Recreate trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Recreate trigger for billing table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_billing_updated_at ON public.billing;
        CREATE TRIGGER update_billing_updated_at
            BEFORE UPDATE ON public.billing
            FOR EACH ROW
            EXECUTE FUNCTION update_billing_updated_at();
    END IF;
END $$;

-- Recreate trigger for user_preferences table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
        CREATE TRIGGER update_user_preferences_updated_at
            BEFORE UPDATE ON public.user_preferences
            FOR EACH ROW
            EXECUTE FUNCTION update_user_preferences_updated_at();
    END IF;
END $$;

-- Recreate triggers for other tables that use update_updated_at_column
DO $$
DECLARE
    table_name text;
    tables_to_update text[] := ARRAY['clients', 'cases', 'documents', 'billing_entries', 'calendar_events', 'deadlines'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_update
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', table_name, table_name);
            EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
        END IF;
    END LOOP;
END $$;

-- 7. Ensure storage bucket RLS policies are properly set up (idempotent)
-- Enable Row Level Security on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create storage policies for documents bucket
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
  );

CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid() = owner
  );

CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
  );

-- Add comments to document this migration
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates default user preferences with proper search_path';
COMMENT ON FUNCTION update_billing_updated_at() IS 'Function to update billing table updated_at timestamp with proper search_path';
COMMENT ON FUNCTION update_user_preferences_updated_at() IS 'Function to update user_preferences table updated_at timestamp with proper search_path';
COMMENT ON FUNCTION update_updated_at_column() IS 'Generic function to update updated_at timestamp with proper search_path';
COMMENT ON TABLE public.user_preferences IS 'User preferences table with RLS policies - users can only access their own preferences';
COMMENT ON TABLE storage.objects IS 'Storage objects with RLS policies for documents bucket - users can only access their own files';
