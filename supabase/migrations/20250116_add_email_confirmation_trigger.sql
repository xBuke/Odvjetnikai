-- Migration: Add email confirmation trigger to activate trial
-- Created: 2025-01-16
-- Description: Creates trigger to activate trial when user confirms email

-- 1. Create function to activate trial on email confirmation
CREATE OR REPLACE FUNCTION activate_trial_on_email_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email was just confirmed (email_confirmed_at changed from null to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Activate trial for the user
    UPDATE public.profiles 
    SET 
      subscription_status = 'trialing',
      subscription_plan = 'trial',
      trial_expires_at = NOW() + INTERVAL '7 days',
      trial_limit = 20,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION activate_trial_on_email_confirm();

-- 3. Update handle_new_user function to NOT set trial status immediately
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create basic profile record for new user (trial will be activated by email confirmation)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    username,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert a default user preference record for the new user
  INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
  VALUES (NEW.id, 'cases', 'created_at', 'desc')
  ON CONFLICT (user_id, page) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
