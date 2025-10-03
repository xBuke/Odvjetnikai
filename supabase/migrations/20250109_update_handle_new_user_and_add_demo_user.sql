-- Migration: Update handle_new_user function and add demo user
-- Created: 2025-01-09
-- Description: Updates handle_new_user function to include full_name, avatar_url, role fields and adds demo user

-- 1. Add missing columns to profiles table if they don't exist
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
END $$;

-- 2. Update handle_new_user function to include new fields and set default subscription_status to 'active'
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
    'active',
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

-- 3. Recreate trigger for handle_new_user (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Insert demo user into auth.users table
-- Generate a UUID for the demo user
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Generate UUID for demo user
    demo_user_id := gen_random_uuid();
    
    -- Insert into auth.users table
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
        crypt('demo123', gen_salt('bf')),
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
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Get the actual user ID (in case it already existed)
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@odvjetnikai.com';
    
    -- Insert into public.profiles table
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
        'active',
        'basic'
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- 6. Add comments to document this migration
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates profile with full_name, avatar_url, role and default active subscription';

-- 7. Verification query - select the demo user to confirm creation
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
