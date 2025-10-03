-- ======================================================
-- Law Firm SaaS - Database Verification Script
-- Run this script in Supabase SQL Editor to verify migration
-- ======================================================

-- ======================================================
-- 1. ENUM TYPES VERIFICATION
-- ======================================================

SELECT '=== ENUM TYPES VERIFICATION ===' as verification_section;

-- Check if required enum types exist
SELECT 
    'document_type' as enum_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') 
        THEN (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
              FROM pg_enum e 
              JOIN pg_type t ON e.enumtypid = t.oid 
              WHERE t.typname = 'document_type')
        ELSE 'N/A'
    END as values
UNION ALL
SELECT 
    'subscription_plan' as enum_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') 
        THEN (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
              FROM pg_enum e 
              JOIN pg_type t ON e.enumtypid = t.oid 
              WHERE t.typname = 'subscription_plan')
        ELSE 'N/A'
    END as values
UNION ALL
SELECT 
    'subscription_status' as enum_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') 
        THEN (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
              FROM pg_enum e 
              JOIN pg_type t ON e.enumtypid = t.oid 
              WHERE t.typname = 'subscription_status')
        ELSE 'N/A'
    END as values
UNION ALL
SELECT 
    'case_status' as enum_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status') 
        THEN (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
              FROM pg_enum e 
              JOIN pg_type t ON e.enumtypid = t.oid 
              WHERE t.typname = 'case_status')
        ELSE 'N/A'
    END as values
UNION ALL
SELECT 
    'case_status_type' as enum_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status_type') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status_type') 
        THEN (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
              FROM pg_enum e 
              JOIN pg_type t ON e.enumtypid = t.oid 
              WHERE t.typname = 'case_status_type')
        ELSE 'N/A'
    END as values
UNION ALL
SELECT 
    'billing_status' as enum_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_status') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_status') 
        THEN (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
              FROM pg_enum e 
              JOIN pg_type t ON e.enumtypid = t.oid 
              WHERE t.typname = 'billing_status')
        ELSE 'N/A'
    END as values;

-- ======================================================
-- 2. TABLES VERIFICATION
-- ======================================================

SELECT '=== TABLES VERIFICATION ===' as verification_section;

-- Check if required tables exist and show their structure
SELECT 
    'profiles' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'clients' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'clients' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'cases' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'cases' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'documents' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'documents' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'billing' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'billing' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'billing_entries' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_entries' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_entries' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'billing_entries' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'calendar_events' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'calendar_events' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'deadlines' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deadlines' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deadlines' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'deadlines' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count
UNION ALL
SELECT 
    'user_preferences' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences' AND table_schema = 'public') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences' AND table_schema = 'public') 
        THEN (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'user_preferences' AND table_schema = 'public')
        ELSE 'N/A'
    END as column_count;

-- ======================================================
-- 3. TABLE STRUCTURES DETAILED
-- ======================================================

SELECT '=== TABLE STRUCTURES ===' as verification_section;

-- Show detailed structure for each table
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'cases' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cases' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'documents' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'billing' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'billing' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ======================================================
-- 4. FOREIGN KEY RELATIONSHIPS VERIFICATION
-- ======================================================

SELECT '=== FOREIGN KEY RELATIONSHIPS ===' as verification_section;

-- Check foreign key relationships
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN tc.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
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
-- 5. INDEXES VERIFICATION
-- ======================================================

SELECT '=== INDEXES VERIFICATION ===' as verification_section;

-- Check if required indexes exist
SELECT 
    'idx_cases_user_id' as index_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cases_user_id') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'idx_documents_case_id' as index_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_case_id') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'idx_documents_user_id' as index_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_user_id') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'idx_billing_user_id' as index_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_billing_user_id') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'idx_clients_user_id' as index_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_user_id') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'idx_profiles_email' as index_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_email') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'idx_profiles_subscription_status' as index_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_subscription_status') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status;

-- Show all indexes for verification
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY tablename, indexname;

-- ======================================================
-- 6. RLS (ROW LEVEL SECURITY) VERIFICATION
-- ======================================================

SELECT '=== RLS VERIFICATION ===' as verification_section;

-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY tablename;

-- ======================================================
-- 7. RLS POLICIES VERIFICATION
-- ======================================================

SELECT '=== RLS POLICIES VERIFICATION ===' as verification_section;

-- Check if required RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')
ORDER BY tablename, policyname;

-- ======================================================
-- 8. FUNCTIONS VERIFICATION
-- ======================================================

SELECT '=== FUNCTIONS VERIFICATION ===' as verification_section;

-- Check if required functions exist
SELECT 
    'handle_new_user' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'user_has_active_subscription' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_has_active_subscription') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'update_user_subscription_status' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_subscription_status') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'start_trial_for_user' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'start_trial_for_user') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'is_user_on_trial' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_user_on_trial') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'is_trial_expired' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_trial_expired') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'get_trial_days_left' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_trial_days_left') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'check_trial_entity_limit' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_trial_entity_limit') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status;

-- ======================================================
-- 9. TRIGGERS VERIFICATION
-- ======================================================

SELECT '=== TRIGGERS VERIFICATION ===' as verification_section;

-- Check if required triggers exist
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND event_object_table IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences', 'auth.users')
ORDER BY event_object_table, trigger_name;

-- ======================================================
-- 10. SUMMARY REPORT
-- ======================================================

SELECT '=== SUMMARY REPORT ===' as verification_section;

-- Count total components
SELECT 
    'Enum Types' as component_type,
    COUNT(*) as total_expected,
    COUNT(*) as total_found,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ ALL PRESENT'
        ELSE '❌ SOME MISSING'
    END as status
FROM pg_type 
WHERE typname IN ('document_type', 'subscription_plan', 'subscription_status', 'case_status', 'case_status_type', 'billing_status')

UNION ALL

SELECT 
    'Tables' as component_type,
    9 as total_expected,
    COUNT(*) as total_found,
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ ALL PRESENT'
        ELSE '❌ SOME MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')

UNION ALL

SELECT 
    'RLS Enabled Tables' as component_type,
    9 as total_expected,
    COUNT(*) as total_found,
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ ALL ENABLED'
        ELSE '❌ SOME DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND rowsecurity = true
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')

UNION ALL

SELECT 
    'RLS Policies' as component_type,
    9 as total_expected,
    COUNT(DISTINCT tablename) as total_found,
    CASE 
        WHEN COUNT(DISTINCT tablename) = 9 THEN '✅ ALL TABLES HAVE POLICIES'
        ELSE '❌ SOME TABLES MISSING POLICIES'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'clients', 'cases', 'documents', 'billing', 'billing_entries', 'calendar_events', 'deadlines', 'user_preferences')

UNION ALL

SELECT 
    'Functions' as component_type,
    8 as total_expected,
    COUNT(*) as total_found,
    CASE 
        WHEN COUNT(*) = 8 THEN '✅ ALL PRESENT'
        ELSE '❌ SOME MISSING'
    END as status
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'user_has_active_subscription', 'update_user_subscription_status', 'start_trial_for_user', 'is_user_on_trial', 'is_trial_expired', 'get_trial_days_left', 'check_trial_entity_limit');

-- ======================================================
-- VERIFICATION COMPLETE
-- ======================================================

SELECT '=== VERIFICATION COMPLETE ===' as verification_section;
SELECT 'Review the results above to ensure all components are properly configured.' as message;
