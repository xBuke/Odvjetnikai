-- Add subscription status support using Supabase's recommended approach
-- Run this SQL in your Supabase SQL Editor

-- Create a function to check if user has active subscription
-- This function reads from the user's metadata (recommended Supabase approach)
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.users.raw_user_meta_data->>'subscription_status')::text = 'active',
      false
    )
    FROM auth.users 
    WHERE auth.users.id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy for cases table that only allows access to users with active subscription
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "active_users_only" ON cases;

CREATE POLICY "active_users_only"
ON cases
FOR ALL
USING (user_has_active_subscription(auth.uid()));

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;

-- Note: This policy will restrict ALL operations (SELECT, INSERT, UPDATE, DELETE) on the cases table
-- to only users whose subscription_status in their metadata is 'active'
-- Users with 'inactive' or no subscription_status will not be able to access any cases data
