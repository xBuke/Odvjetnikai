-- Create billing_entries table for time tracking and billing
-- Run this SQL in your Supabase SQL Editor

-- Create billing_entries table
CREATE TABLE IF NOT EXISTS billing_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    hours DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_billing_entries_user_id ON billing_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_client_id ON billing_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_case_id ON billing_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_created_at ON billing_entries(created_at);

-- Enable Row Level Security
ALTER TABLE billing_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for billing_entries
CREATE POLICY "Users can view their own billing entries" ON billing_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing entries" ON billing_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing entries" ON billing_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billing entries" ON billing_entries
    FOR DELETE USING (auth.uid() = user_id);
