-- Fix: Enable RLS and secure policies on user_preferences
-- This script is idempotent and safe to rerun in Supabase

-- Step 1: Enable Row Level Security on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Step 3: Create SELECT policy - users can only read their own rows
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Step 4: Create UPDATE policy - users can only update their own rows
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Optional: Create INSERT policy for completeness (users can only insert their own rows)
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional: Create DELETE policy for completeness (users can only delete their own rows)
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Verify the policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_preferences' 
ORDER BY policyname;
