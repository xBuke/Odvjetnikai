-- Update user_preferences table to support multiple pages
-- Run this SQL in your Supabase SQL Editor

-- Add page column to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS page TEXT NOT NULL DEFAULT 'cases';

-- Drop the existing unique constraint on user_id
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_key;

-- Add new unique constraint on user_id + page combination
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_page_key UNIQUE (user_id, page);

-- Update existing records to have page = 'cases' (if any exist)
UPDATE user_preferences SET page = 'cases' WHERE page IS NULL OR page = '';

-- Create index for better performance on the new unique constraint
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id_page ON user_preferences(user_id, page);

-- Update RLS policies to work with the new page column
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

-- Create new policies that work with page column
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);
