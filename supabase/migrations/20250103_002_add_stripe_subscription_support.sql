-- Add Stripe subscription support to the law firm SaaS
-- This migration adds subscription fields and updates RLS policies

-- Add subscription fields to auth.users metadata
-- Note: We'll use the raw_user_meta_data field to store subscription info
-- This is the recommended approach for Supabase auth

-- Create a function to check if user has active subscription
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

-- Create a function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.users.raw_user_meta_data->>'subscription_status')::text,
      'inactive'
    )
    FROM auth.users 
    WHERE auth.users.id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update user subscription status
CREATE OR REPLACE FUNCTION update_user_subscription_status(
  user_id UUID,
  status TEXT,
  stripe_customer_id TEXT DEFAULT NULL,
  stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_metadata JSONB;
BEGIN
  -- Get current metadata
  SELECT raw_user_meta_data INTO current_metadata
  FROM auth.users 
  WHERE id = user_id;
  
  -- Update metadata with subscription info
  current_metadata := COALESCE(current_metadata, '{}'::jsonb);
  current_metadata := current_metadata || jsonb_build_object(
    'subscription_status', status,
    'stripe_customer_id', COALESCE(stripe_customer_id, current_metadata->>'stripe_customer_id'),
    'stripe_subscription_id', COALESCE(stripe_subscription_id, current_metadata->>'stripe_subscription_id'),
    'subscription_updated_at', NOW()::text
  );
  
  -- Update the user
  UPDATE auth.users 
  SET raw_user_meta_data = current_metadata
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to recreate them with subscription checks
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Users can view their own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert their own cases" ON cases;
DROP POLICY IF EXISTS "Users can update their own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete their own cases" ON cases;

DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

DROP POLICY IF EXISTS "Users can view their own billing" ON billing;
DROP POLICY IF EXISTS "Users can insert their own billing" ON billing;
DROP POLICY IF EXISTS "Users can update their own billing" ON billing;
DROP POLICY IF EXISTS "Users can delete their own billing" ON billing;

DROP POLICY IF EXISTS "Users can view their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Users can insert their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Users can update their own billing entries" ON billing_entries;
DROP POLICY IF EXISTS "Users can delete their own billing entries" ON billing_entries;

DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;

DROP POLICY IF EXISTS "Users can view their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can insert their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can update their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can delete their own deadlines" ON deadlines;

-- Recreate policies with subscription status checks
-- Clients policies
CREATE POLICY "Active subscribers can view their own clients" ON clients
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own clients" ON clients
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own clients" ON clients
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own clients" ON clients
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Cases policies
CREATE POLICY "Active subscribers can view their own cases" ON cases
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own cases" ON cases
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own cases" ON cases
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own cases" ON cases
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Documents policies
CREATE POLICY "Active subscribers can view their own documents" ON documents
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own documents" ON documents
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own documents" ON documents
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own documents" ON documents
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Billing policies
CREATE POLICY "Active subscribers can view their own billing" ON billing
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own billing" ON billing
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own billing" ON billing
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own billing" ON billing
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Billing entries policies
CREATE POLICY "Active subscribers can view their own billing entries" ON billing_entries
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own billing entries" ON billing_entries
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own billing entries" ON billing_entries
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own billing entries" ON billing_entries
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Calendar events policies
CREATE POLICY "Active subscribers can view their own calendar events" ON calendar_events
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own calendar events" ON calendar_events
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own calendar events" ON calendar_events
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own calendar events" ON calendar_events
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- Deadlines policies
CREATE POLICY "Active subscribers can view their own deadlines" ON deadlines
    FOR SELECT USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can insert their own deadlines" ON deadlines
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can update their own deadlines" ON deadlines
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );
CREATE POLICY "Active subscribers can delete their own deadlines" ON deadlines
    FOR DELETE USING (
        auth.uid() = user_id AND 
        user_has_active_subscription(auth.uid())
    );

-- User preferences policies (allow access even without subscription for basic settings)
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to handle new user registration with default subscription status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default subscription status to inactive for new users
  NEW.raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'subscription_status', 'inactive',
      'created_at', NOW()::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_subscription_status(UUID, TEXT, TEXT, TEXT) TO service_role;
