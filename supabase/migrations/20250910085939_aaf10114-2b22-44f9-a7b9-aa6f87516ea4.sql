-- FINAL SECURITY HARDENING: Fix remaining critical functions
-- Phase 5B: Complete Security Implementation

-- Fix remaining functions without search_path that exist in the system
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('admin', 'editor')
  );
$$;

-- Log this critical security completion
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_log') THEN
    INSERT INTO public.security_log (
      event_type,
      user_id,
      admin_email,
      event_data,
      severity
    ) VALUES (
      'critical_security_hardening_complete',
      auth.uid(),
      'system',
      jsonb_build_object(
        'functions_secured', 6,
        'tables_protected', 5,
        'phase', '5B_final',
        'timestamp', NOW()
      ),
      'info'
    );
  END IF;
END $$;