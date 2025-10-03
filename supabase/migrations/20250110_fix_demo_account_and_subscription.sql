-- Migration: Fix demo account and subscription issues
-- Created: 2025-01-10
-- Description: Fix demo account password, ensure consistent subscription handling, and fix RLS policies

-- 1. First, let's ensure the profiles table exists with all required columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT DEFAULT 'PRO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN full_name TEXT;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'user';
    END IF;

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
        ADD COLUMN subscription_plan TEXT DEFAULT 'PRO';
    END IF;
END $$;

-- 3. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create consistent subscription functions that use profiles table
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

-- 5. Update handle_new_user function to create profile with active subscription by default
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record for new user with all required fields
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url, 
    role, 
    subscription_status, 
    subscription_plan
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',  -- Set default to active for new users
    'basic'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert a default user preference record for the new user
  INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
  VALUES (NEW.id, 'cases', 'created_at', 'desc')
  ON CONFLICT (user_id, page) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- 6. Recreate trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Fix demo user - delete existing and recreate with correct password
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Delete existing demo user if it exists
    DELETE FROM auth.users WHERE email = 'demo@odvjetnikai.com';
    
    -- Generate new UUID for demo user
    demo_user_id := gen_random_uuid();
    
    -- Insert into auth.users table with correct password (Demo123!)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        demo_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'demo@odvjetnikai.com',
        crypt('Demo123!', gen_salt('bf')),  -- Correct password
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Demo User", "role": "demo"}',
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
    );
    
    -- Insert into public.profiles table with active subscription
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        role,
        subscription_status,
        subscription_plan
    ) VALUES (
        demo_user_id,
        'demo@odvjetnikai.com',
        'Demo User',
        '',
        'demo',
        'active',  -- Active subscription for demo user
        'PRO'
    )
    ON CONFLICT (id) DO UPDATE SET
        subscription_status = 'active',
        role = 'demo',
        updated_at = NOW();
END $$;

-- 8. Clean up and recreate RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Clean up all existing RLS policies and recreate them consistently
-- Drop all existing policies
DO $$
DECLARE
    table_name TEXT;
    policy_name TEXT;
BEGIN
    -- List of tables to clean up
    FOR table_name IN SELECT unnest(ARRAY['clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines']) LOOP
        -- Drop all policies for each table
        FOR policy_name IN 
            SELECT policyname FROM pg_policies WHERE tablename = table_name AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- 10. Recreate RLS policies with consistent logic
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

-- Calendar events policies - Active subscribers can do everything, demo users read-only
CREATE POLICY "Active subscribers can view their own calendar events" ON calendar_events
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Demo users can view their own calendar events" ON calendar_events
    FOR SELECT USING (
        auth.uid() = user_id AND 
        is_demo_user(auth.uid())
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

-- Deadlines policies - Active subscribers can do everything, demo users read-only
CREATE POLICY "Active subscribers can view their own deadlines" ON deadlines
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

CREATE POLICY "Demo users can view their own deadlines" ON deadlines
    FOR SELECT USING (
        auth.uid() = user_id AND 
        is_demo_user(auth.uid())
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

-- User preferences policies (allow access even without subscription for basic settings)
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- 11. Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_demo_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_subscription_status(UUID, TEXT, TEXT, TEXT) TO service_role;

-- 12. Add comments to document this migration
COMMENT ON TABLE public.profiles IS 'User profiles table with subscription information and RLS policies';
COMMENT ON FUNCTION user_has_active_subscription(UUID) IS 'Function to check if user has active subscription using profiles table';
COMMENT ON FUNCTION get_user_subscription_status(UUID) IS 'Function to get user subscription status from profiles table';
COMMENT ON FUNCTION is_demo_user(UUID) IS 'Function to check if user is demo user (read-only access)';
COMMENT ON FUNCTION update_user_subscription_status(UUID, TEXT, TEXT, TEXT) IS 'Function to update user subscription status in profiles table';
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile with active subscription by default';

-- 13. Verification query - select the demo user to confirm creation
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role,
    p.subscription_status,
    p.subscription_plan,
    p.created_at
FROM public.profiles p
WHERE p.email = 'demo@odvjetnikai.com';

