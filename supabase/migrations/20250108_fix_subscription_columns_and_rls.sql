-- Migration: Fix subscription_status error in RLS
-- Created: 2025-01-08
-- Description: Add subscription columns to profiles table and enforce RLS correctly
-- Commit: "fix: add subscription columns to profiles and enforce RLS correctly"

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add subscription columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;

    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_plan'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_plan TEXT DEFAULT 'basic';
    END IF;
END $$;

-- 3. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for profiles table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Create function to check if user has active subscription using profiles table
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT subscription_status FROM public.profiles WHERE id = user_id) = 'active',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to check if user is demo user (read-only access)
CREATE OR REPLACE FUNCTION is_demo_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT email FROM public.profiles WHERE id = user_id) = 'demo@odvjetnikai.com',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Drop existing RLS policies to recreate them with subscription checks
-- Clients policies
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can view their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can update their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can delete their own clients" ON clients;

-- Cases policies
DROP POLICY IF EXISTS "Users can view their own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert their own cases" ON cases;
DROP POLICY IF EXISTS "Users can update their own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can view their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can insert their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can update their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can delete their own cases" ON cases;
DROP POLICY IF EXISTS "active_users_only" ON cases;

-- Documents policies
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can view their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can update their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can delete their own documents" ON documents;

-- Billing policies
DROP POLICY IF EXISTS "Users can view their own billing" ON billing;
DROP POLICY IF EXISTS "Users can insert their own billing" ON billing;
DROP POLICY IF EXISTS "Users can update their own billing" ON billing;
DROP POLICY IF EXISTS "Users can delete their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can view their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can insert their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can update their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can delete their own billing" ON billing;

-- Billing entries policies
DROP POLICY IF EXISTS "Users can view their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Users can insert their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Users can update their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Users can delete their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can view their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can insert their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can update their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can delete their own billing entries" ON billing_entries;

-- 8. Recreate RLS policies with subscription checks
-- Clients policies - Active subscribers can do everything, demo users read-only
CREATE POLICY "Active subscribers can view their own clients" ON clients
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Demo users can view their own clients" ON clients
    FOR SELECT USING (
        auth.uid() = user_id AND 
        is_demo_user(auth.uid())
    );

CREATE POLICY "Active subscribers can insert their own clients" ON clients
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can update their own clients" ON clients
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can delete their own clients" ON clients
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Cases policies - Active subscribers can do everything, demo users read-only
CREATE POLICY "Active subscribers can view their own cases" ON cases
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Demo users can view their own cases" ON cases
    FOR SELECT USING (
        auth.uid() = user_id AND 
        is_demo_user(auth.uid())
    );

CREATE POLICY "Active subscribers can insert their own cases" ON cases
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can update their own cases" ON cases
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can delete their own cases" ON cases
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Documents policies - Active subscribers can do everything, demo users read-only
CREATE POLICY "Active subscribers can view their own documents" ON documents
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Demo users can view their own documents" ON documents
    FOR SELECT USING (
        auth.uid() = user_id AND 
        is_demo_user(auth.uid())
    );

CREATE POLICY "Active subscribers can insert their own documents" ON documents
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can update their own documents" ON documents
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can delete their own documents" ON documents
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Billing policies - Active subscribers can do everything, demo users read-only
CREATE POLICY "Active subscribers can view their own billing" ON billing
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Demo users can view their own billing" ON billing
    FOR SELECT USING (
        auth.uid() = user_id AND 
        is_demo_user(auth.uid())
    );

CREATE POLICY "Active subscribers can insert their own billing" ON billing
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can update their own billing" ON billing
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can delete their own billing" ON billing
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Billing entries policies - Active subscribers can do everything, demo users read-only
CREATE POLICY "Active subscribers can view their own billing entries" ON billing_entries
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Demo users can view their own billing entries" ON billing_entries
    FOR SELECT USING (
        auth.uid() = user_id AND 
        is_demo_user(auth.uid())
    );

CREATE POLICY "Active subscribers can insert their own billing entries" ON billing_entries
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can update their own billing entries" ON billing_entries
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Active subscribers can delete their own billing entries" ON billing_entries
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- 9. Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record for new user
  INSERT INTO public.profiles (id, email, subscription_status, subscription_plan)
  VALUES (NEW.id, NEW.email, 'inactive', 'basic')
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert a default user preference record for the new user
  INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
  VALUES (NEW.id, 'cases', 'created_at', 'desc')
  ON CONFLICT (user_id, page) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- 10. Recreate trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 11. Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_demo_user(UUID) TO authenticated;

-- 12. Add comments to document this migration
COMMENT ON TABLE public.profiles IS 'User profiles table with subscription information and RLS policies';
COMMENT ON FUNCTION user_has_active_subscription(UUID) IS 'Function to check if user has active subscription using profiles table';
COMMENT ON FUNCTION is_demo_user(UUID) IS 'Function to check if user is demo user (read-only access)';
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile and default user preferences';
