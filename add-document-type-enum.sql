-- Add document_type enum and type field to documents table
-- Run this SQL in your Supabase SQL Editor

-- Create the document_type enum
CREATE TYPE document_type AS ENUM (
    'ugovor',
    'pravni_dokument', 
    'nacrt_dokumenta',
    'financijski_dokument',
    'korespondencija',
    'dokazni_materijal'
);

-- Add the type column to the documents table
ALTER TABLE documents 
ADD COLUMN type document_type;

-- Create an index on the type column for better performance
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Update existing documents to have a default type (optional)
-- You can uncomment and modify this if you have existing documents
-- UPDATE documents SET type = 'pravni_dokument' WHERE type IS NULL;
