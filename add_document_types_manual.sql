-- Manual script to add Punomoć and Tužba document types
-- Run this in Supabase SQL Editor or via CLI

-- Add new enum values if they don't exist
DO $$
BEGIN
    -- Add 'punomoc' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'punomoc' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
        ALTER TYPE document_type ADD VALUE 'punomoc';
        RAISE NOTICE 'Added punomoc to document_type enum';
    ELSE
        RAISE NOTICE 'punomoc already exists in document_type enum';
    END IF;
    
    -- Add 'tuzba' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tuzba' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
        ALTER TYPE document_type ADD VALUE 'tuzba';
        RAISE NOTICE 'Added tuzba to document_type enum';
    ELSE
        RAISE NOTICE 'tuzba already exists in document_type enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type') ORDER BY enumsortorder;
