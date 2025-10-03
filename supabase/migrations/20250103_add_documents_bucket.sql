-- Migration: Add documents storage bucket with Row Level Security policies
-- Created: 2025-01-03
-- Description: Creates the 'documents' storage bucket and sets up RLS policies for secure document access

-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the documents storage bucket if it doesn't exist
-- Note: This will only work if the bucket doesn't already exist
-- If the bucket already exists, this will be a no-op
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
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Policy 1: Users can view their own documents
-- Allows SELECT operations on documents where the user is the owner
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
  );

-- Policy 2: Users can upload their own documents
-- Allows INSERT operations on documents where the user will be the owner
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid() = owner
  );

-- Policy 3: Users can delete their own documents
-- Allows DELETE operations on documents where the user is the owner
CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' 
    AND auth.uid() = owner
  );

-- Optional: Add a policy for UPDATE operations if needed
-- Uncomment the following if you want to allow users to update their document metadata
-- DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
-- CREATE POLICY "Users can update their own documents" ON storage.objects
--   FOR UPDATE
--   USING (
--     bucket_id = 'documents' 
--     AND auth.uid() = owner
--   )
--   WITH CHECK (
--     bucket_id = 'documents' 
--     AND auth.uid() = owner
--   );

-- Add a comment to document this migration
COMMENT ON TABLE storage.objects IS 'Storage objects with RLS policies for documents bucket - users can only access their own files';
