-- Migration: Add case_status column to cases table for timeline progression
-- Date: 2025-01-05
-- Description: Adds case_status column to track case progression through timeline steps

-- Add case_status column to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS case_status TEXT DEFAULT 'Zaprimanje';

-- Add check constraint to ensure valid case_status values
-- First drop the constraint if it exists, then add it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_case_status') THEN
        ALTER TABLE cases DROP CONSTRAINT check_case_status;
    END IF;
END $$;

ALTER TABLE cases ADD CONSTRAINT check_case_status 
CHECK (case_status IN ('Zaprimanje', 'Priprema', 'Ročište', 'Presuda'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cases_case_status ON cases(case_status);

-- Update existing cases to have the default case_status
UPDATE cases SET case_status = 'Zaprimanje' WHERE case_status IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN cases.case_status IS 'Timeline status for case progression: Zaprimanje, Priprema, Ročište, Presuda';
