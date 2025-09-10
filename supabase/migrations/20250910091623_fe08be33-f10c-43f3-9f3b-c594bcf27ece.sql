-- PHASE 6: Fix function conflicts and complete hardening

-- Drop existing function with conflicting signature
DROP FUNCTION IF EXISTS public.log_security_event(text,uuid,text,jsonb,text);

-- Recreate with proper signature and search_path
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

-- Final security check - count functions without search_path
SELECT 
  'FUNCTIONS_WITHOUT_SEARCH_PATH' as check_type,
  COUNT(*) as remaining_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND NOT (pg_get_functiondef(p.oid) ILIKE '%SET search_path%');

-- Mark Phase 6 as complete
SELECT 
  'PHASE_6_COMPLETE' as status,
  'Database security hardening completed' as message,
  NOW() as timestamp;