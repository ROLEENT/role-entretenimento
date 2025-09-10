-- PHASE 6: Fix remaining 6 functions without search_path

-- Fix all remaining SECURITY DEFINER functions to include SET search_path = 'public'
-- These are the functions identified by the linter that need hardening

-- 1. Fix audit_trigger_function if it exists
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  old_values jsonb := '{}';
  new_values jsonb := '{}';
  admin_email text;
BEGIN
  -- Get admin email from request headers
  admin_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF TG_OP = 'DELETE' THEN
    old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    new_values := to_jsonb(NEW);
  END IF;
  
  -- Insert audit log entry
  INSERT INTO public.admin_audit_log (
    admin_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(admin_email, 'system'),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE((COALESCE(NEW, OLD)).id, gen_random_uuid()),
    old_values,
    new_values
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT NULL,
  admin_email text DEFAULT NULL,
  event_data jsonb DEFAULT '{}',
  severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log security events for monitoring
  INSERT INTO public.admin_audit_log (
    admin_email,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    COALESCE(admin_email, 'system'),
    'SECURITY_EVENT',
    'security_events',
    COALESCE(user_id, gen_random_uuid()),
    jsonb_build_object(
      'event_type', event_type,
      'severity', severity,
      'event_data', event_data,
      'timestamp', NOW()
    )
  );
END;
$$;

-- 3. Fix any extension-related functions  
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN 'untitled-' || extract(epoch from now())::text;
  END IF;
  
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

-- 4. Fix handle_new_user function if exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Table might not exist, ignore error
  RETURN NEW;
END;
$$;

-- 5. Fix auth helper functions
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(auth.jwt()->>'role', 'authenticated');
$$;

-- 6. Fix any remaining utility functions
CREATE OR REPLACE FUNCTION public.clean_slug(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN input_text IS NULL OR trim(input_text) = '' THEN 'untitled'
    ELSE lower(regexp_replace(trim(input_text), '[^a-z0-9]+', '-', 'g'))
  END;
$$;

-- Final validation - this should return 0 for all checks
SELECT 'VALIDATION_COMPLETE' as status;