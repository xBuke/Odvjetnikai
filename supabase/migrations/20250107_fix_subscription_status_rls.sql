-- Migration: Fix subscription_status error in RLS
-- Created: 2025-01-07
-- Description: Add profiles table with subscription columns and recreate RLS policies

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns to profiles table if they don't exist
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

-- 6. Create function to get user subscription status from profiles table
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT subscription_status FROM public.profiles WHERE id = user_id),
      'inactive'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to update user subscription status in profiles table
CREATE OR REPLACE FUNCTION update_user_subscription_status(
  user_id UUID,
  status TEXT,
  stripe_customer_id TEXT DEFAULT NULL,
  stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update or insert profile record
  INSERT INTO public.profiles (id, subscription_status, updated_at)
  VALUES (user_id, status, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    subscription_status = EXCLUDED.subscription_status,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Drop existing RLS policies to recreate them with subscription checks
DROP POLICY IF EXISTS "Active subscribers can view their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can update their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Active subscribers can view their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can insert their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can update their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can delete their own cases" ON cases;

DROP POLICY IF EXISTS "Active subscribers can view their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can update their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can delete their own documents" ON documents;

DROP POLICY IF EXISTS "Active subscribers can view their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can insert their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can update their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can delete their own billing" ON billing;

DROP POLICY IF EXISTS "Active subscribers can view their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can insert their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can update their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can delete their own billing entries" ON billing_entries;

DROP POLICY IF EXISTS "Active subscribers can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Active subscribers can insert their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Active subscribers can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Active subscribers can delete their own calendar events" ON calendar_events;

DROP POLICY IF EXISTS "Active subscribers can view their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Active subscribers can insert their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Active subscribers can update their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Active subscribers can delete their own deadlines" ON deadlines;

-- 9. Recreate RLS policies with subscription checks using profiles table
-- Clients policies
CREATE POLICY "Active subscribers can view their own clients" ON clients
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
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

-- Cases policies
CREATE POLICY "Active subscribers can view their own cases" ON cases
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
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

-- Documents policies
CREATE POLICY "Active subscribers can view their own documents" ON documents
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
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

-- Billing policies
CREATE POLICY "Active subscribers can view their own billing" ON billing
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
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

-- Billing entries policies
CREATE POLICY "Active subscribers can view their own billing entries" ON billing_entries
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
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

-- Calendar events policies
CREATE POLICY "Active subscribers can view their own calendar events" ON calendar_events
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own calendar events" ON calendar_events
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own calendar events" ON calendar_events
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own calendar events" ON calendar_events
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Deadlines policies
CREATE POLICY "Active subscribers can view their own deadlines" ON deadlines
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own deadlines" ON deadlines
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own deadlines" ON deadlines
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own deadlines" ON deadlines
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- 10. Add special demo user read-only access
-- Demo user (demo@odvjetnikai.com) can only select (read-only), no insert/update/delete
CREATE POLICY "Demo user can view all data" ON clients
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'demo@odvjetnikai.com'
    );

CREATE POLICY "Demo user can view all cases" ON cases
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'demo@odvjetnikai.com'
    );

CREATE POLICY "Demo user can view all documents" ON documents
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'demo@odvjetnikai.com'
    );

CREATE POLICY "Demo user can view all billing" ON billing
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'demo@odvjetnikai.com'
    );

CREATE POLICY "Demo user can view all billing entries" ON billing_entries
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'demo@odvjetnikai.com'
    );

CREATE POLICY "Demo user can view all calendar events" ON calendar_events
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'demo@odvjetnikai.com'
    );

CREATE POLICY "Demo user can view all deadlines" ON deadlines
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'demo@odvjetnikai.com'
    );

-- 11. Update handle_new_user function to create profile record
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

-- 12. Recreate trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 13. Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_subscription_status(UUID, TEXT, TEXT, TEXT) TO service_role;

-- 14. Add comments to document this migration
COMMENT ON TABLE public.profiles IS 'User profiles table with subscription information and RLS policies';
COMMENT ON FUNCTION user_has_active_subscription(UUID) IS 'Function to check if user has active subscription using profiles table';
COMMENT ON FUNCTION get_user_subscription_status(UUID) IS 'Function to get user subscription status from profiles table';
COMMENT ON FUNCTION update_user_subscription_status(UUID, TEXT, TEXT, TEXT) IS 'Function to update user subscription status in profiles table';
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile and default user preferences';
