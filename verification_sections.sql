-- ======================================================
-- Law Firm SaaS - Database Verification (Section by Section)
-- Run each section separately in Supabase SQL Editor
-- ======================================================

-- ======================================================
-- SECTION 1: Check Enum Types
-- ======================================================
SELECT '=== ENUM TYPES ===' as section;

SELECT 
    typname as enum_name,
    CASE 
        WHEN typname = 'document_type' THEN '✅ document_type'
        WHEN typname = 'subscription_plan' THEN '✅ subscription_plan'
        WHEN typname = 'subscription_status' THEN '✅ subscription_status'
        WHEN typname = 'case_status' THEN '✅ case_status'
        WHEN typname = 'case_status_type' THEN '✅ case_status_type'
        WHEN typname = 'billing_status' THEN '✅ billing_status'
        ELSE '❌ ' || typname
    END as status
FROM pg_type 
WHERE typname IN ('document_type', 'subscription_plan', 'subscription_status', 'case_status', 'case_status_type', 'billing_status')
ORDER BY typname;

-- ======================================================
-- SECTION 2: Check Tables
-- ======================================================
SELECT '=== TABLES ===' as section;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'profiles' THEN '✅ profiles'
        WHEN table_name = 'clients' THEN '✅ clients'
        WHEN table_name = 'cases' THEN '✅ cases'
        WHEN table_name = 'documents' THEN '✅ documents'
        WHEN table_name = 'billing' THEN '✅ billing'
        WHEN table_name = 'billing_entries' THEN '✅ billing_entries'
        WHEN table_name = 'calendar_events' THEN '✅ calendar_events'
        WHEN table_name = 'deadlines' THEN '✅ deadlines'
        WHEN table_name = 'user_preferences' THEN '✅ user_preferences'
        ELSE '❌ ' || table_name
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY table_name;

-- ======================================================
-- SECTION 3: Check Foreign Keys
-- ======================================================
SELECT '=== FOREIGN KEYS ===' as section;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅ FK EXISTS' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY tc.table_name, kcu.column_name;

-- ======================================================
-- SECTION 4: Check Indexes
-- ======================================================
SELECT '=== INDEXES ===' as section;

SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ ' || indexname
        ELSE '❌ ' || indexname
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY tablename, indexname;

-- ======================================================
-- SECTION 5: Check RLS
-- ======================================================
SELECT '=== RLS STATUS ===' as section;

SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY tablename;

-- ======================================================
-- SECTION 6: Check RLS Policies
-- ======================================================
SELECT '=== RLS POLICIES ===' as section;

SELECT 
    tablename,
    policyname,
    '✅ POLICY EXISTS' as status
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY tablename, policyname;

-- ======================================================
-- SECTION 7: Check Functions
-- ======================================================
SELECT '=== FUNCTIONS ===' as section;

SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'handle_new_user' THEN '✅ handle_new_user'
        WHEN proname = 'user_has_active_subscription' THEN '✅ user_has_active_subscription'
        WHEN proname = 'update_user_subscription_status' THEN '✅ update_user_subscription_status'
        WHEN proname = 'start_trial_for_user' THEN '✅ start_trial_for_user'
        WHEN proname = 'is_user_on_trial' THEN '✅ is_user_on_trial'
        WHEN proname = 'is_trial_expired' THEN '✅ is_trial_expired'
        WHEN proname = 'get_trial_days_left' THEN '✅ get_trial_days_left'
        WHEN proname = 'check_trial_entity_limit' THEN '✅ check_trial_entity_limit'
        ELSE '❌ ' || proname
    END as status
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'user_has_active_subscription', 'update_user_subscription_status', 'start_trial_for_user', 'is_user_on_trial', 'is_trial_expired', 'get_trial_days_left', 'check_trial_entity_limit')
ORDER BY proname;

-- ======================================================
-- SECTION 8: Check Triggers
-- ======================================================
SELECT '=== TRIGGERS ===' as section;

SELECT 
    trigger_name,
    event_object_table,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ ' || trigger_name
        ELSE '❌ MISSING'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND event_object_table IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences', 'auth.users')
ORDER BY event_object_table, trigger_name;
