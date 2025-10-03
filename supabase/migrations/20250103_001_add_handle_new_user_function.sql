-- Migration: Add handle_new_user function for user creation
-- Created: 2025-01-03
-- Description: Creates a function to handle new user creation with proper search_path

-- Create function to handle new user creation
-- This function is typically triggered when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a default user preference record for the new user
    INSERT INTO public.user_preferences (user_id, page, sort_field, sort_direction)
    VALUES (NEW.id, 'cases', 'created_at', 'desc')
    ON CONFLICT (user_id, page) DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Create trigger to call handle_new_user when a new user is created
-- This trigger fires after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Add a comment to document this migration
COMMENT ON FUNCTION handle_new_user() IS 'Function to handle new user creation - creates default user preferences';
