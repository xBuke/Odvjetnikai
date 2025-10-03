-- Add document_type enum and type field to documents table
-- Run this SQL in your Supabase SQL Editor
-- This migration is idempotent and safe to rerun

-- Create the document_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
            'ugovor',
            'pravni_dokument', 
            'nacrt_dokumenta',
            'financijski_dokument',
            'korespondencija',
            'dokazni_materijal'
        );
    END IF;
END $$;

-- Add the type column to the documents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE documents ADD COLUMN type document_type;
    END IF;
END $$;

-- Create an index on the type column for better performance
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Update existing documents to have a default type (optional)
-- You can uncomment and modify this if you have existing documents
-- UPDATE documents SET type = 'pravni_dokument' WHERE type IS NULL;
