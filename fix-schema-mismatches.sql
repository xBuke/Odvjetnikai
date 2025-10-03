-- =====================================================
-- Schema Fix: Align Supabase schema with application requirements
-- Date: 2025-01-13
-- Description: Fix mismatches between database schema and application logic
-- =====================================================

-- 1. Ensure profiles table has all required columns
-- Create profiles table if it doesn't exist with all required fields
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
    -- Add username column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'username'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN username TEXT;
    END IF;

    -- Add trial_expires_at column if it doesn't exist (standardize naming)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_expires_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add trial_limit column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_limit'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN trial_limit INTEGER DEFAULT 20;
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
        ADD COLUMN subscription_plan TEXT DEFAULT 'basic';
    END IF;

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
END $$;

-- 3. Migrate data from trial_end_date to trial_expires_at if needed
DO $$
BEGIN
    -- If trial_end_date exists but trial_expires_at doesn't have data, copy it over
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'trial_end_date'
        AND table_schema = 'public'
    ) THEN
        UPDATE public.profiles 
        SET trial_expires_at = trial_end_date 
        WHERE trial_expires_at IS NULL AND trial_end_date IS NOT NULL;
    END IF;
END $$;

-- 4. Create the missing trg_before_insert_enforce_trial function
-- This is a generic trial enforcement function that can be used across tables
CREATE OR REPLACE FUNCTION trg_before_insert_enforce_trial()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  entity_type TEXT;
BEGIN
  -- Determine entity type based on table name
  entity_type := TG_TABLE_NAME;
  
  -- Count current entities for this user
  EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE user_id = $1', TG_TABLE_NAME)
  INTO current_count
  USING NEW.user_id;

  -- Check trial limits using the existing function
  PERFORM check_trial_entity_limit(NEW.user_id, entity_type, current_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update handle_new_user function to include username and use trial_expires_at
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

-- 6. Update user_has_active_subscription function to use trial_expires_at
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

-- 7. Update is_trial_expired function to use trial_expires_at
CREATE OR REPLACE FUNCTION is_trial_expired(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT trial_expires_at FROM public.profiles WHERE id = user_id) < NOW(),
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Update start_trial_for_user function to use trial_expires_at
CREATE OR REPLACE FUNCTION start_trial_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    subscription_status = 'trial',
    trial_expires_at = NOW() + INTERVAL '7 days',
    trial_limit = 20,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update get_trial_days_left function to use trial_expires_at
CREATE OR REPLACE FUNCTION get_trial_days_left(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      EXTRACT(DAY FROM (trial_expires_at - NOW()))::INTEGER,
      0
    )
    FROM public.profiles 
    WHERE id = user_id AND subscription_status = 'trial'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update check_trial_entity_limit function to use trial_expires_at
CREATE OR REPLACE FUNCTION check_trial_entity_limit(
  user_id UUID,
  entity_type TEXT,
  current_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  user_trial_limit INTEGER;
  user_subscription_status TEXT;
  user_trial_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user trial information
  SELECT subscription_status, trial_limit, trial_expires_at
  INTO user_subscription_status, user_trial_limit, user_trial_expires_at
  FROM public.profiles 
  WHERE id = user_id;

  -- If not on trial, allow creation
  IF user_subscription_status != 'trial' THEN
    RETURN true;
  END IF;

  -- If trial expired, block creation
  IF user_trial_expires_at < NOW() THEN
    RAISE EXCEPTION 'Trial expired';
  END IF;

  -- If trial limit reached, block creation
  IF current_count >= user_trial_limit THEN
    RAISE EXCEPTION 'Trial limit reached';
  END IF;

  -- Trial is active and limit not reached
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 12. Create/update RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 13. Grant necessary permissions
GRANT EXECUTE ON FUNCTION trg_before_insert_enforce_trial() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_expired(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION start_trial_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_left(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_trial_entity_limit(UUID, TEXT, INTEGER) TO authenticated;

-- 14. Recreate trigger for handle_new_user (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 15. Add comments to document the changes
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile with trial status, 7-day trial period, and all required fields including username';
COMMENT ON FUNCTION user_has_active_subscription(user_id UUID) IS 'Function to check if user has active subscription or valid trial period using trial_expires_at';
COMMENT ON FUNCTION trg_before_insert_enforce_trial() IS 'Generic trigger function to enforce trial limits on entity creation';

-- 16. Verification queries
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username' AND table_schema = 'public')
        THEN 'SUCCESS: username column exists in profiles table'
        ELSE 'ERROR: username column missing from profiles table'
    END as username_column_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_expires_at' AND table_schema = 'public')
        THEN 'SUCCESS: trial_expires_at column exists in profiles table'
        ELSE 'ERROR: trial_expires_at column missing from profiles table'
    END as trial_expires_at_column_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'trg_before_insert_enforce_trial' AND routine_schema = 'public')
        THEN 'SUCCESS: trg_before_insert_enforce_trial function exists'
        ELSE 'ERROR: trg_before_insert_enforce_trial function missing'
    END as trigger_function_check;
