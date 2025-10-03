-- Add Punomoć and Tužba document types to existing enum
-- This migration adds new values to the existing document_type enum

-- Add new enum values if they don't exist
DO $$
BEGIN
    -- Add 'punomoc' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'punomoc' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
        ALTER TYPE document_type ADD VALUE 'punomoc';
    END IF;
    
    -- Add 'tuzba' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tuzba' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
        ALTER TYPE document_type ADD VALUE 'tuzba';
    END IF;
END $$;
