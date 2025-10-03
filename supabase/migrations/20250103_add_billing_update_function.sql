-- Migration: Add update_billing_updated_at function
-- Created: 2025-01-03
-- Description: Creates a function to handle billing table updates with proper search_path

-- Create function to update billing updated_at timestamp
CREATE OR REPLACE FUNCTION update_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Create trigger for billing table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing') THEN
        DROP TRIGGER IF EXISTS update_billing_updated_at ON billing;
        CREATE TRIGGER update_billing_updated_at
            BEFORE UPDATE ON billing
            FOR EACH ROW
            EXECUTE FUNCTION update_billing_updated_at();
    END IF;
END $$;

-- Add a comment to document this migration
COMMENT ON FUNCTION update_billing_updated_at() IS 'Function to update billing table updated_at timestamp';
