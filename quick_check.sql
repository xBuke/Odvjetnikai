-- Quick Database Check - Run this first
-- This will show you what's working and what's missing

-- 1. Check if main tables exist
SELECT 'TABLES' as check_type, table_name, 'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'cases', 'documents', 'billing', 'clients')
ORDER BY table_name;
