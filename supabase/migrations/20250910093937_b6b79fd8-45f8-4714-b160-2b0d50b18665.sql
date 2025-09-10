-- Fix security issues identified by linter

-- Add search_path to functions that don't have it set
ALTER FUNCTION public.check_and_award_badges(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_points(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_badges(uuid) SET search_path TO 'public';
ALTER FUNCTION public.check_user_is_editor_or_admin() SET search_path TO 'public';
ALTER FUNCTION public.track_analytics_event(text, jsonb, text, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.get_analytics_summary(date, date) SET search_path TO 'public';

-- Update auth configuration for better security
-- Note: These are configuration changes that should be made in Supabase dashboard
-- OTP expiry and leaked password protection need to be configured in auth settings

-- Add comment to document required manual configuration
COMMENT ON SCHEMA public IS 'Security Notes: 
1. Configure OTP expiry to max 1 hour in Auth settings
2. Enable leaked password protection in Auth settings  
3. Schedule Postgres upgrade in Platform settings
Configuration URL: https://supabase.com/dashboard/project/nutlcbnruabjsxecqpnd/settings/auth';

-- Create audit function for security events
CREATE OR REPLACE FUNCTION public.audit_security_configuration()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Return security configuration status
  result := jsonb_build_object(
    'functions_with_search_path', (
      SELECT COUNT(*) FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.prosecdef = true
        AND pg_get_functiondef(p.oid) ILIKE '%SET search_path%'
    ),
    'total_security_definer_functions', (
      SELECT COUNT(*) FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.prosecdef = true
    ),
    'audit_timestamp', NOW()
  );
  
  RETURN result;
END;
$$;