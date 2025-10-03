-- =====================================================
-- SQL Test Script: Migration Validation for Odvjetnikai
-- Tests the 20250109_update_handle_new_user_and_add_demo_user migration
-- =====================================================

-- Set up test environment
\echo 'Starting migration validation tests...'
\echo '=========================================='

-- =====================================================
-- TEST 1: Verify profiles table structure
-- =====================================================
\echo ''
\echo 'TEST 1: Verifying profiles table structure...'
\echo '---------------------------------------------'

-- Check if profiles table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'profiles'
        ) 
        THEN 'PASS: profiles table exists'
        ELSE 'FAIL: profiles table does not exist'
    END as table_existence_check;

-- Check required columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('id', 'full_name', 'avatar_url', 'role', 'subscription_status')
ORDER BY column_name;

-- Verify column count and types
SELECT 
    CASE 
        WHEN COUNT(*) = 5 THEN 'PASS: All required columns present'
        ELSE 'FAIL: Missing required columns (expected 5, found ' || COUNT(*) || ')'
    END as column_count_check
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('id', 'full_name', 'avatar_url', 'role', 'subscription_status');

-- =====================================================
-- TEST 2: Verify handle_new_user function exists
-- =====================================================
\echo ''
\echo 'TEST 2: Verifying handle_new_user function...'
\echo '---------------------------------------------'

-- Check if function exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
              AND routine_name = 'handle_new_user'
              AND routine_type = 'FUNCTION'
        ) 
        THEN 'PASS: handle_new_user function exists in public schema'
        ELSE 'FAIL: handle_new_user function does not exist in public schema'
    END as function_existence_check;

-- Get function details
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- =====================================================
-- TEST 3: Test trigger functionality with fake user
-- =====================================================
\echo ''
\echo 'TEST 3: Testing trigger functionality...'
\echo '---------------------------------------'

-- Generate test user ID
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Generate random UUID for test user
    test_user_id := gen_random_uuid();
    
    \echo 'Generated test user ID: ' || test_user_id;
    
    -- Insert test user into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'test_user@example.com',
        crypt('test123', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Test User", "avatar_url": "https://example.com/avatar.png", "role": "user"}',
        false,
        NOW(),
        NOW()
    );
    
    \echo 'Test user inserted into auth.users';
END $$;

-- Verify the trigger created a profile record
\echo ''
\echo 'Verifying profile was created by trigger...'
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
WHERE p.email = 'test_user@example.com';

-- Verify the profile data matches the auth.users data
\echo ''
\echo 'Verifying profile data matches auth.users data...'
SELECT 
    CASE 
        WHEN p.id = u.id THEN 'PASS: Profile ID matches auth.users ID'
        ELSE 'FAIL: Profile ID does not match auth.users ID'
    END as id_match_check,
    CASE 
        WHEN p.full_name = (u.raw_user_meta_data->>'full_name') THEN 'PASS: Full name matches'
        ELSE 'FAIL: Full name does not match'
    END as full_name_check,
    CASE 
        WHEN p.avatar_url = (u.raw_user_meta_data->>'avatar_url') THEN 'PASS: Avatar URL matches'
        ELSE 'FAIL: Avatar URL does not match'
    END as avatar_url_check,
    CASE 
        WHEN p.role = (u.raw_user_meta_data->>'role') THEN 'PASS: Role matches'
        ELSE 'FAIL: Role does not match'
    END as role_check,
    CASE 
        WHEN p.subscription_status = 'active' THEN 'PASS: Subscription status is active'
        ELSE 'FAIL: Subscription status is not active'
    END as subscription_status_check
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'test_user@example.com';

-- =====================================================
-- TEST 4: Verify demo user exists
-- =====================================================
\echo ''
\echo 'TEST 4: Verifying demo user exists...'
\echo '------------------------------------'

-- Check if demo user exists in auth.users
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'demo@odvjetnikai.com'
        ) 
        THEN 'PASS: Demo user exists in auth.users'
        ELSE 'FAIL: Demo user does not exist in auth.users'
    END as demo_user_auth_check;

-- Check if demo user exists in profiles
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE email = 'demo@odvjetnikai.com'
        ) 
        THEN 'PASS: Demo user exists in profiles'
        ELSE 'FAIL: Demo user does not exist in profiles'
    END as demo_user_profile_check;

-- Get demo user details from both tables
\echo ''
\echo 'Demo user details from auth.users:'
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email = 'demo@odvjetnikai.com';

\echo ''
\echo 'Demo user details from profiles:'
SELECT 
    id,
    email,
    full_name,
    avatar_url,
    role,
    subscription_status,
    subscription_plan,
    created_at
FROM public.profiles 
WHERE email = 'demo@odvjetnikai.com';

-- Verify demo user has correct subscription status
\echo ''
\echo 'Verifying demo user subscription status...'
SELECT 
    CASE 
        WHEN p.subscription_status = 'active' THEN 'PASS: Demo user has active subscription'
        ELSE 'FAIL: Demo user does not have active subscription (status: ' || p.subscription_status || ')'
    END as demo_subscription_check
FROM public.profiles p
WHERE p.email = 'demo@odvjetnikai.com';

-- =====================================================
-- TEST 5: Clean up test user
-- =====================================================
\echo ''
\echo 'TEST 5: Cleaning up test user...'
\echo '-------------------------------'

-- Delete test user (this should cascade to profiles due to foreign key)
DELETE FROM auth.users WHERE email = 'test_user@example.com';

-- Verify cleanup
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'test_user@example.com'
        ) 
        THEN 'PASS: Test user removed from auth.users'
        ELSE 'FAIL: Test user still exists in auth.users'
    END as cleanup_auth_check;

SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE email = 'test_user@example.com'
        ) 
        THEN 'PASS: Test user removed from profiles'
        ELSE 'FAIL: Test user still exists in profiles'
    END as cleanup_profile_check;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================
\echo ''
\echo '=========================================='
\echo 'MIGRATION VALIDATION COMPLETE'
\echo '=========================================='
\echo ''
\echo 'Summary of tests performed:'
\echo '1. ✓ Verified profiles table structure'
\echo '2. ✓ Verified handle_new_user function exists'
\echo '3. ✓ Tested trigger functionality with fake user'
\echo '4. ✓ Verified demo user exists with correct data'
\echo '5. ✓ Cleaned up test data'
\echo ''
\echo 'If all tests show PASS, the migration was applied correctly!'
