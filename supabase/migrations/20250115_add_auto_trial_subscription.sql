-- Migration: Add automatic trial subscription creation
-- Created: 2025-01-15
-- Description: Modify handle_new_user to create Stripe subscription with trial period

-- 1. Add Stripe-related columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add stripe_customer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
    END IF;
    
    -- Add stripe_subscription_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT;
    END IF;
END $$;

-- 2. Create function to create trial subscription
CREATE OR REPLACE FUNCTION create_trial_subscription(user_id UUID, user_email TEXT)
RETURNS VOID AS $$
DECLARE
    customer_id TEXT;
    subscription_id TEXT;
    price_id TEXT;
    trial_end_timestamp INTEGER;
BEGIN
    -- Get the basic price ID from environment (this would be set in your app)
    price_id := 'price_basic'; -- This should be replaced with actual price ID
    
    -- Calculate trial end (7 days from now)
    trial_end_timestamp := EXTRACT(EPOCH FROM (NOW() + INTERVAL '7 days'))::INTEGER;
    
    -- For now, just update the profile with trial info
    -- The actual Stripe subscription creation will be handled by the API
    UPDATE public.profiles 
    SET 
        subscription_status = 'trial',
        subscription_plan = 'basic',
        trial_expires_at = NOW() + INTERVAL '7 days',
        trial_limit = 20,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Log the trial creation (you might want to create a webhook or API call here)
    -- This is a placeholder - in production, you'd call your API endpoint
    RAISE NOTICE 'Trial subscription created for user % with email %', user_id, user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update handle_new_user function to create trial subscription
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
  
  -- Create trial subscription (this will be handled by API call in production)
  PERFORM create_trial_subscription(NEW.id, NEW.email);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to check and handle expired trials
CREATE OR REPLACE FUNCTION check_expired_trials()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    trial_expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.trial_expires_at
    FROM public.profiles p
    WHERE p.subscription_status = 'trial'
    AND p.trial_expires_at < NOW()
    AND p.trial_expires_at > NOW() - INTERVAL '1 hour'; -- Only recent expirations
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status(
    user_id UUID,
    status TEXT,
    plan TEXT DEFAULT NULL,
    stripe_customer_id TEXT DEFAULT NULL,
    stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        subscription_status = status::subscription_status,
        subscription_plan = COALESCE(plan::subscription_plan, subscription_plan),
        stripe_customer_id = COALESCE(stripe_customer_id, stripe_customer_id),
        stripe_subscription_id = COALESCE(stripe_subscription_id, stripe_subscription_id),
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
