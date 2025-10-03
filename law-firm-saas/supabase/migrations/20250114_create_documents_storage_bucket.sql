-- =====================================================
-- Migration: Create Documents Storage Bucket with RLS Policies
-- Date: 2025-01-14
-- Description: Creates the 'documents' storage bucket and sets up comprehensive RLS policies
-- =====================================================

-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the documents storage bucket if it doesn't exist
-- Note: This will only work if the bucket doesn't already exist
-- If the bucket already exists, this will be a no-op
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

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view documents in demo mode" ON storage.objects;

-- Policy 1: Authenticated users can INSERT (upload) their own files
-- Allows INSERT operations on documents where the user will be the owner
CREATE POLICY "Authenticated users can upload their own documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid() = owner
    AND auth.role() = 'authenticated'
  );

-- Policy 2: Authenticated users can SELECT (view/download) only their own files
-- Allows SELECT operations on documents where the user is the owner
CREATE POLICY "Authenticated users can view their own documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
    AND auth.role() = 'authenticated'
  );

-- Policy 3: Authenticated users can DELETE their own files
-- Allows DELETE operations on documents where the user is the owner
CREATE POLICY "Authenticated users can delete their own documents" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
    AND auth.role() = 'authenticated'
  );

-- Policy 4: Optional PUBLIC SELECT policy for demo mode
-- This policy allows public access to view documents when demo mode is enabled
-- Note: This is commented out by default for security. Uncomment if demo mode is needed.
-- CREATE POLICY "Public can view documents in demo mode" ON storage.objects
--   FOR SELECT
--   USING (
--     bucket_id = 'documents'
--     -- Add your demo mode condition here, for example:
--     -- AND (SELECT demo_mode_enabled FROM app_settings LIMIT 1) = true
--   );

-- Add a comment to document this migration
COMMENT ON TABLE storage.objects IS 'Storage objects with RLS policies for documents bucket - users can only access their own files';

-- Add a comment to the bucket
COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration - documents bucket is private with user-specific access policies';
