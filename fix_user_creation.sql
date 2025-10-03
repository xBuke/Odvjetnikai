-- =====================================================
-- Fix User Creation Database Error
-- Date: 2025-01-15
-- Description: Fix handle_new_user function to properly create new users with trial status
-- =====================================================

-- 1. Ensure profiles table has all required columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    username TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT DEFAULT 'basic',
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    trial_limit INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;

    -- Add username column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'username'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;

    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;

    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_plan'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_plan TEXT DEFAULT 'basic';
    END IF;

    -- Add trial_expires_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_expires_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add trial_limit column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_limit'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN trial_limit INTEGER DEFAULT 20;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page VARCHAR(50) NOT NULL,
    sort_field VARCHAR(50) NOT NULL,
    sort_direction VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, page)
);

-- 4. Create simplified handle_new_user function
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
    username,
    subscription_status,
    subscription_plan,
    trial_expires_at,
    trial_limit
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    'trial',  -- New users start with trial status
    'basic',  -- Default plan
    NOW() + INTERVAL '7 days',  -- Trial expires in 7 days
    20  -- Default trial limit
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert a default user preference record for the new user
  INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
  VALUES (NEW.id, 'cases', 'created_at', 'desc')
  ON CONFLICT (user_id, page) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 6. Create function to check if user has active subscription
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
        AND trial_expires_at > NOW()
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    status TEXT;
BEGIN
    SELECT subscription_status INTO status
    FROM public.profiles 
    WHERE id = user_id;
    
    -- If user is on trial, check if it's expired
    IF status = 'trial' THEN
        IF EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = user_id 
            AND trial_expires_at < NOW()
        ) THEN
            RETURN 'expired';
        ELSE
            RETURN 'trial';
        END IF;
    END IF;
    
    RETURN COALESCE(status, 'inactive');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy for system to insert profiles (for new user creation)
CREATE POLICY "System can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- 9. Add RLS policies for user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;

-- Add comment to document this fix
COMMENT ON FUNCTION handle_new_user() IS 'Fixed function to handle new user creation with trial status';
