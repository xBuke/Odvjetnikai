-- Law Firm SaaS Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
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
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
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
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    document_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS billing (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
    case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    billing_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
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
INSERT INTO clients (name, email, phone, oib, notes) VALUES
('Marko Marić', 'marko.maric@email.com', '+385 91 123 4567', '12345678901', 'Long-term client, specializes in corporate law'),
('Ana Novak', 'ana.novak@email.com', '+385 98 765 4321', '23456789012', 'Family law specialist, very responsive'),
('Petar Petrović', 'petar.petrovic@email.com', '+385 95 555 1234', '34567890123', 'Business client, needs regular legal consultation'),
('Ivana Ivanić', 'ivana.ivanic@email.com', '+385 92 333 4444', '45678901234', 'New client, interested in property law'),
('Tomislav Tomić', 'tomislav.tomic@email.com', '+385 99 888 7777', '56789012345', 'Corporate client, large company');

-- Insert sample cases
INSERT INTO cases (client_id, title, notes, status, case_type, start_date) VALUES
(1, 'Corporate Merger', 'Legal consultation for company merger with international partner', 'Open', 'Corporate Law', '2024-01-15'),
(2, 'Divorce Settlement', 'Amicable divorce proceedings and asset division', 'In Progress', 'Family Law', '2024-02-01'),
(3, 'Contract Dispute', 'Breach of contract case with supplier', 'Open', 'Commercial Law', '2024-02-10'),
(4, 'Property Purchase', 'Legal assistance with real estate transaction', 'In Progress', 'Property Law', '2024-02-15'),
(5, 'Employment Law', 'Workplace discrimination case', 'Closed', 'Employment Law', '2024-02-20');

-- Insert sample billing records
INSERT INTO billing (client_id, case_id, amount, description, billing_date, status) VALUES
(1, 1, 2500.00, 'Initial consultation and document review', '2024-01-15', 'paid'),
(2, 2, 1800.00, 'Divorce proceedings and mediation', '2024-02-01', 'pending'),
(3, 3, 1200.00, 'Contract analysis and legal advice', '2024-02-10', 'pending'),
(4, 4, 950.00, 'Property transaction legal review', '2024-02-15', 'paid'),
(5, 5, 2100.00, 'Employment law consultation and documentation', '2024-02-20', 'pending');

-- Insert sample calendar events
INSERT INTO calendar_events (title, description, start_time, end_time, client_id, case_id) VALUES
('Client Meeting - Marko Marić', 'Discuss merger details and timeline', '2024-03-01 10:00:00+00', '2024-03-01 11:30:00+00', 1, 1),
('Court Hearing - Ana Novak', 'Divorce settlement hearing', '2024-03-05 14:00:00+00', '2024-03-05 16:00:00+00', 2, 2),
('Document Review - Petar Petrović', 'Review contract terms and conditions', '2024-03-08 09:00:00+00', '2024-03-08 10:30:00+00', 3, 3),
('Property Inspection - Ivana Ivanić', 'Site visit for property transaction', '2024-03-12 11:00:00+00', '2024-03-12 12:00:00+00', 4, 4),
('Legal Consultation - Tomislav Tomić', 'Employment law strategy meeting', '2024-03-15 15:00:00+00', '2024-03-15 16:30:00+00', 5, 5);

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
