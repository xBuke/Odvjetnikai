-- Migration: Add update_user_preferences_updated_at function
-- Created: 2025-01-03
-- Description: Creates a function to handle user_preferences table updates with proper search_path

-- Create function to update user_preferences updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Create trigger for user_preferences table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
        CREATE TRIGGER update_user_preferences_updated_at
            BEFORE UPDATE ON user_preferences
            FOR EACH ROW
            EXECUTE FUNCTION update_user_preferences_updated_at();
    END IF;
END $$;

-- Add a comment to document this migration
COMMENT ON FUNCTION update_user_preferences_updated_at() IS 'Function to update user_preferences table updated_at timestamp';
