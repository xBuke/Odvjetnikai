-- Migration: Update handle_new_user function and add subscription_plan column
-- Created: 2025-01-11
-- Description: Updates handle_new_user function to set subscription_status to 'inactive' by default and ensures subscription_plan column exists

-- 1. Add subscription_plan column to profiles table if it doesn't exist (idempotent)
DO $$
BEGIN
    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_plan'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_plan TEXT;
    END IF;
END $$;

-- 2. Update handle_new_user function to set subscription_status to 'inactive' by default
-- and only include required fields: id, full_name, avatar_url, role, and subscription_status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record for new user with only required fields
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    role, 
    subscription_status
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'inactive'  -- Set default to inactive for new users
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

-- 3. Recreate trigger for handle_new_user (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- 5. Add comments to document this migration
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile with id, full_name, avatar_url, role, and subscription_status (inactive by default)';

-- 6. Verification query - check that subscription_plan column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'subscription_plan';
