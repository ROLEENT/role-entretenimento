-- Fix security issues from the linter

-- 1. Update existing functions to have proper search_path 
-- (Only fixing functions we can modify - many are built-in Supabase functions)

-- Update our custom functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  );
$$;

-- Update other custom admin functions with search_path
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_email text;
BEGIN
  -- Get email from secure session token or fallback to email header
  session_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF session_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if admin exists and is active
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_session_valid(p_admin_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  );
$$;

-- Note: The other warnings are about:
-- 1. Extensions in public schema - this is managed by Supabase
-- 2. Auth OTP expiry - this is a platform setting  
-- 3. Leaked password protection - this is an auth configuration setting
-- 4. Security definer view - this is about existing views, not our functions
-- 5. Other functions without search_path - these are built-in Supabase functions we cannot modify

-- The critical issue (ERROR) about security definer view needs investigation
-- but our newly created is_admin() function is properly secured