-- =====================================================
-- Migration: Remove Demo User and Cleanup
-- Date: 2025-01-13
-- Description: Remove demo user logic and clean up RLS policies
-- =====================================================

-- 1. Remove demo user from auth.users table
DELETE FROM auth.users WHERE email = 'demo@odvjetnikai.com';

-- 2. Remove demo user from profiles table (should cascade from auth.users deletion)
-- This is just a safety measure in case the cascade doesn't work
DELETE FROM public.profiles WHERE email = 'demo@odvjetnikai.com';

-- 3. Remove demo-specific RLS policies
-- Drop all demo user read-only policies
DROP POLICY IF EXISTS "Demo user can view all data" ON clients;
DROP POLICY IF EXISTS "Demo user can view all cases" ON cases;
DROP POLICY IF EXISTS "Demo user can view all documents" ON documents;
DROP POLICY IF EXISTS "Demo user can view all billing" ON billing;
DROP POLICY IF EXISTS "Demo user can view all billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Demo user can view all calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Demo user can view all deadlines" ON deadlines;

-- 4. Update RLS policies to remove demo user exceptions
-- Recreate policies without demo user special cases

-- Clients policies - Only active subscribers can access their own data
DROP POLICY IF EXISTS "Active subscribers can view their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can update their own clients" ON clients;
DROP POLICY IF EXISTS "Active subscribers can delete their own clients" ON clients;

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
DROP POLICY IF EXISTS "Active subscribers can view their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can insert their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can update their own cases" ON cases;
DROP POLICY IF EXISTS "Active subscribers can delete their own cases" ON cases;

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
DROP POLICY IF EXISTS "Active subscribers can view their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can update their own documents" ON documents;
DROP POLICY IF EXISTS "Active subscribers can delete their own documents" ON documents;

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
DROP POLICY IF EXISTS "Active subscribers can view their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can insert their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can update their own billing" ON billing;
DROP POLICY IF EXISTS "Active subscribers can delete their own billing" ON billing;

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
DROP POLICY IF EXISTS "Active subscribers can view their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can insert their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can update their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Active subscribers can delete their own billing entries" ON billing_entries;

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
DROP POLICY IF EXISTS "Active subscribers can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Active subscribers can insert their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Active subscribers can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Active subscribers can delete their own calendar events" ON calendar_events;

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
DROP POLICY IF EXISTS "Active subscribers can view their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Active subscribers can insert their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Active subscribers can update their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Active subscribers can delete their own deadlines" ON deadlines;

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

-- 5. Update handle_new_user function to create users with trial status
-- This ensures new users get a 7-day trial instead of active subscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record for new user with trial status
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    subscription_status,
    subscription_plan,
    trial_start_date,
    trial_end_date
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'trial',  -- New users start with trial status
    'basic',  -- Default plan
    NOW(),    -- Trial starts now
    NOW() + INTERVAL '7 days'  -- Trial ends in 7 days
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add trial fields to profiles table if they don't exist
DO $$
BEGIN
    -- Add trial_start_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'trial_start_date'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN trial_start_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add trial_end_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'trial_end_date'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN trial_end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 7. Update user_has_active_subscription function to include trial users
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND (
      subscription_status = 'active' 
      OR (
        subscription_status = 'trial' 
        AND trial_end_date > NOW()
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add comment to document the changes
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile with trial status and 7-day trial period';
COMMENT ON FUNCTION user_has_active_subscription(user_id UUID) IS 'Function to check if user has active subscription or valid trial period';

-- 9. Verification query - confirm demo user is removed
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@odvjetnikai.com')
        THEN 'SUCCESS: Demo user removed from auth.users'
        ELSE 'WARNING: Demo user still exists in auth.users'
    END as demo_user_removal_check;

SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'demo@odvjetnikai.com')
        THEN 'SUCCESS: Demo user removed from profiles'
        ELSE 'WARNING: Demo user still exists in profiles'
    END as demo_profile_removal_check;
