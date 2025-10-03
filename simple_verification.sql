-- ======================================================
-- Law Firm SaaS - Simple Database Verification
-- Run each section separately in Supabase SQL Editor
-- ======================================================

-- ======================================================
-- SECTION 1: Check Enum Types
-- ======================================================
SELECT 'ENUM TYPES CHECK' as check_type;

SELECT 
    typname as enum_name,
    'EXISTS' as status
FROM pg_type 
WHERE typname IN ('document_type', 'subscription_plan', 'subscription_status', 'case_status', 'case_status_type', 'billing_status')
ORDER BY typname;
