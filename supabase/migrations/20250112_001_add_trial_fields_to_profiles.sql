-- Migration: Add trial fields to profiles table
-- Created: 2025-01-12
-- Description: Add trial_expires_at and trial_limit columns to profiles table for 7-day trial support

-- 1. Add trial_expires_at column to profiles table if it doesn't exist
DO $$
BEGIN
    -- Add trial_expires_at column if it doesn't exist
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
END $$;

-- 2. Update subscription_status to support 'trial' status
-- This is handled by the application logic, but we ensure the column can accept 'trial'

-- 3. Create a function to start trial for a user
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

-- 4. Create a function to check if user is on trial
CREATE OR REPLACE FUNCTION is_user_on_trial(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT subscription_status FROM public.profiles WHERE id = user_id) = 'trial',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a function to check if trial has expired
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

-- 6. Create a function to get trial days left
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

-- 7. Create a function to check trial entity limits
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

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION start_trial_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_on_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_expired(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_left(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_trial_entity_limit(UUID, TEXT, INTEGER) TO authenticated;
