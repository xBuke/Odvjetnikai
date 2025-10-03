-- Migration: Update RLS policies to support trial users
-- Created: 2025-01-12
-- Description: Update RLS policies to allow trial users to access entities within their limits

-- 1. Update RLS policy for clients table to allow trial users
DROP POLICY IF EXISTS "active_users_only" ON public.clients;
CREATE POLICY "active_and_trial_users_only" ON public.clients
FOR ALL
USING (
  user_has_active_subscription(auth.uid()) OR 
  (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
);

-- 2. Update RLS policy for cases table to allow trial users
DROP POLICY IF EXISTS "active_users_only" ON public.cases;
CREATE POLICY "active_and_trial_users_only" ON public.cases
FOR ALL
USING (
  user_has_active_subscription(auth.uid()) OR 
  (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
);

-- 3. Update RLS policy for documents table to allow trial users
DROP POLICY IF EXISTS "active_users_only" ON public.documents;
CREATE POLICY "active_and_trial_users_only" ON public.documents
FOR ALL
USING (
  user_has_active_subscription(auth.uid()) OR 
  (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
);

-- 4. Update RLS policy for billing_entries table to allow trial users
DROP POLICY IF EXISTS "active_users_only" ON public.billing_entries;
CREATE POLICY "active_and_trial_users_only" ON public.billing_entries
FOR ALL
USING (
  user_has_active_subscription(auth.uid()) OR 
  (is_user_on_trial(auth.uid()) AND NOT is_trial_expired(auth.uid()))
);

-- 5. Create triggers to enforce trial limits on insert
-- For clients table
CREATE OR REPLACE FUNCTION enforce_trial_limit_clients()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count current clients for this user
  SELECT COUNT(*) INTO current_count
  FROM public.clients
  WHERE user_id = NEW.user_id;

  -- Check trial limits
  PERFORM check_trial_entity_limit(NEW.user_id, 'clients', current_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For cases table
CREATE OR REPLACE FUNCTION enforce_trial_limit_cases()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count current cases for this user
  SELECT COUNT(*) INTO current_count
  FROM public.cases
  WHERE user_id = NEW.user_id;

  -- Check trial limits
  PERFORM check_trial_entity_limit(NEW.user_id, 'cases', current_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For documents table
CREATE OR REPLACE FUNCTION enforce_trial_limit_documents()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count current documents for this user
  SELECT COUNT(*) INTO current_count
  FROM public.documents
  WHERE user_id = NEW.user_id;

  -- Check trial limits
  PERFORM check_trial_entity_limit(NEW.user_id, 'documents', current_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create triggers
DROP TRIGGER IF EXISTS trial_limit_clients_trigger ON public.clients;
CREATE TRIGGER trial_limit_clients_trigger
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION enforce_trial_limit_clients();

DROP TRIGGER IF EXISTS trial_limit_cases_trigger ON public.cases;
CREATE TRIGGER trial_limit_cases_trigger
  BEFORE INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION enforce_trial_limit_cases();

DROP TRIGGER IF EXISTS trial_limit_documents_trigger ON public.documents;
CREATE TRIGGER trial_limit_documents_trigger
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION enforce_trial_limit_documents();

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION enforce_trial_limit_clients() TO authenticated;
GRANT EXECUTE ON FUNCTION enforce_trial_limit_cases() TO authenticated;
GRANT EXECUTE ON FUNCTION enforce_trial_limit_documents() TO authenticated;
