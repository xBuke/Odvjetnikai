-- Add automatic updated_at triggers for all tables
-- Run this SQL in your Supabase SQL Editor

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for cases table
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for documents table
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for billing table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing') THEN
        DROP TRIGGER IF EXISTS update_billing_updated_at ON billing;
        CREATE TRIGGER update_billing_updated_at
            BEFORE UPDATE ON billing
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create triggers for calendar_events table
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for deadlines table
DROP TRIGGER IF EXISTS update_deadlines_updated_at ON deadlines;
CREATE TRIGGER update_deadlines_updated_at
    BEFORE UPDATE ON deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for billing_entries table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_entries') THEN
        DROP TRIGGER IF EXISTS update_billing_entries_updated_at ON billing_entries;
        CREATE TRIGGER update_billing_entries_updated_at
            BEFORE UPDATE ON billing_entries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
