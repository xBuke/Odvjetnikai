-- Law Firm SaaS Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    oib VARCHAR(11) NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Open',
    case_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    document_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    billing_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_oib ON clients(oib);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_billing_client_id ON billing(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_case_id ON billing(case_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- For now, we'll allow all operations for authenticated users
-- You can make these more restrictive based on your needs

-- Clients policies
CREATE POLICY "Allow all operations for authenticated users" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Cases policies
CREATE POLICY "Allow all operations for authenticated users" ON cases
    FOR ALL USING (auth.role() = 'authenticated');

-- Documents policies
CREATE POLICY "Allow all operations for authenticated users" ON documents
    FOR ALL USING (auth.role() = 'authenticated');

-- Billing policies
CREATE POLICY "Allow all operations for authenticated users" ON billing
    FOR ALL USING (auth.role() = 'authenticated');

-- Calendar events policies
CREATE POLICY "Allow all operations for authenticated users" ON calendar_events
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO clients (id, name, email, phone, oib, notes) VALUES
('f3f49f0f-49b1-4fbf-bfd4-cf2474df64b3', 'Marko Marić', 'marko.maric@email.com', '+385 91 123 4567', '12345678901', 'Long-term client, specializes in corporate law'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ana Novak', 'ana.novak@email.com', '+385 98 765 4321', '23456789012', 'Family law specialist, very responsive'),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Petar Petrović', 'petar.petrovic@email.com', '+385 95 555 1234', '34567890123', 'Business client, needs regular legal consultation'),
('c3d4e5f6-g7h8-9012-cdef-345678901234', 'Ivana Ivanić', 'ivana.ivanic@email.com', '+385 92 333 4444', '45678901234', 'New client, interested in property law'),
('d4e5f6g7-h8i9-0123-def0-456789012345', 'Tomislav Tomić', 'tomislav.tomic@email.com', '+385 99 888 7777', '56789012345', 'Corporate client, large company');

-- Insert sample cases
INSERT INTO cases (id, client_id, title, notes, status, case_type, start_date) VALUES
('case-1-uuid-1234-5678-9abc-def012345678', 'f3f49f0f-49b1-4fbf-bfd4-cf2474df64b3', 'Corporate Merger', 'Legal consultation for company merger with international partner', 'Open', 'Corporate Law', '2024-01-15'),
('case-2-uuid-2345-6789-abcd-ef0123456789', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Divorce Settlement', 'Amicable divorce proceedings and asset division', 'In Progress', 'Family Law', '2024-02-01'),
('case-3-uuid-3456-789a-bcde-f01234567890', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Contract Dispute', 'Breach of contract case with supplier', 'Open', 'Commercial Law', '2024-02-10'),
('case-4-uuid-4567-89ab-cdef-012345678901', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'Property Purchase', 'Legal assistance with real estate transaction', 'In Progress', 'Property Law', '2024-02-15'),
('case-5-uuid-5678-9abc-def0-123456789012', 'd4e5f6g7-h8i9-0123-def0-456789012345', 'Employment Law', 'Workplace discrimination case', 'Closed', 'Employment Law', '2024-02-20');

-- Insert sample billing records
INSERT INTO billing (id, client_id, case_id, amount, description, billing_date, status) VALUES
('bill-1-uuid-1234-5678-9abc-def012345678', 'f3f49f0f-49b1-4fbf-bfd4-cf2474df64b3', 'case-1-uuid-1234-5678-9abc-def012345678', 2500.00, 'Initial consultation and document review', '2024-01-15', 'paid'),
('bill-2-uuid-2345-6789-abcd-ef0123456789', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'case-2-uuid-2345-6789-abcd-ef0123456789', 1800.00, 'Divorce proceedings and mediation', '2024-02-01', 'pending'),
('bill-3-uuid-3456-789a-bcde-f01234567890', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'case-3-uuid-3456-789a-bcde-f01234567890', 1200.00, 'Contract analysis and legal advice', '2024-02-10', 'pending'),
('bill-4-uuid-4567-89ab-cdef-012345678901', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'case-4-uuid-4567-89ab-cdef-012345678901', 950.00, 'Property transaction legal review', '2024-02-15', 'paid'),
('bill-5-uuid-5678-9abc-def0-123456789012', 'd4e5f6g7-h8i9-0123-def0-456789012345', 'case-5-uuid-5678-9abc-def0-123456789012', 2100.00, 'Employment law consultation and documentation', '2024-02-20', 'pending');

-- Insert sample calendar events
INSERT INTO calendar_events (id, title, description, start_time, end_time, client_id, case_id) VALUES
('event-1-uuid-1234-5678-9abc-def012345678', 'Client Meeting - Marko Marić', 'Discuss merger details and timeline', '2024-03-01 10:00:00+00', '2024-03-01 11:30:00+00', 'f3f49f0f-49b1-4fbf-bfd4-cf2474df64b3', 'case-1-uuid-1234-5678-9abc-def012345678'),
('event-2-uuid-2345-6789-abcd-ef0123456789', 'Court Hearing - Ana Novak', 'Divorce settlement hearing', '2024-03-05 14:00:00+00', '2024-03-05 16:00:00+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'case-2-uuid-2345-6789-abcd-ef0123456789'),
('event-3-uuid-3456-789a-bcde-f01234567890', 'Document Review - Petar Petrović', 'Review contract terms and conditions', '2024-03-08 09:00:00+00', '2024-03-08 10:30:00+00', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'case-3-uuid-3456-789a-bcde-f01234567890'),
('event-4-uuid-4567-89ab-cdef-012345678901', 'Property Inspection - Ivana Ivanić', 'Site visit for property transaction', '2024-03-12 11:00:00+00', '2024-03-12 12:00:00+00', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'case-4-uuid-4567-89ab-cdef-012345678901'),
('event-5-uuid-5678-9abc-def0-123456789012', 'Legal Consultation - Tomislav Tomić', 'Employment law strategy meeting', '2024-03-15 15:00:00+00', '2024-03-15 16:30:00+00', 'd4e5f6g7-h8i9-0123-def0-456789012345', 'case-5-uuid-5678-9abc-def0-123456789012');

-- Create storage bucket for documents
-- Note: This needs to be done through the Supabase Dashboard or API
-- Go to Storage in your Supabase dashboard and create a bucket named 'documents'
-- Then set the following policies:

-- Storage policies for documents bucket
-- These policies need to be created after the bucket is created through the dashboard
-- You can create them through the Supabase dashboard or using the following SQL:

-- Allow authenticated users to upload files
-- INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
-- VALUES (
--   'Allow authenticated users to upload documents',
--   'documents',
--   'true',
--   'auth.role() = ''authenticated'''
-- );

-- Allow authenticated users to view files
-- INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
-- VALUES (
--   'Allow authenticated users to view documents',
--   'documents',
--   'true',
--   'auth.role() = ''authenticated'''
-- );

-- Allow authenticated users to delete files
-- INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
-- VALUES (
--   'Allow authenticated users to delete documents',
--   'documents',
--   'true',
--   'auth.role() = ''authenticated'''
-- );
