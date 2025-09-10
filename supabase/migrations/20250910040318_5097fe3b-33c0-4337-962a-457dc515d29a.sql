-- Primeiro, dropar as funções que têm conflitos de parâmetros
DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);

-- Criar a view do dashboard e corrigir todas as funções
CREATE OR REPLACE VIEW v_admin_dashboard_counts AS
WITH contact_counts AS (
  SELECT 
    'contacts' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as last_7d
  FROM contacts
),
newsletter_counts AS (
  SELECT 
    'newsletter' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as last_7d
  FROM newsletter_subscribers
),
application_counts AS (
  SELECT 
    'job_applications' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as last_7d
  FROM applications
)
SELECT kind, total, last_7d FROM contact_counts
UNION ALL
SELECT kind, total, last_7d FROM newsletter_counts
UNION ALL
SELECT kind, total, last_7d FROM application_counts;

-- Recriar is_admin_session_valid com signature original
CREATE OR REPLACE FUNCTION is_admin_session_valid(p_admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  );
END;
$$;

-- Adicionar SET search_path para funções restantes
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_admin_email text DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Get admin email from parameter or headers
  admin_email := COALESCE(
    p_admin_email,
    (current_setting('request.headers', true))::json ->> 'x-admin-email'
  );
  
  -- Log security event
  INSERT INTO public.security_logs (
    event_type,
    user_id,
    admin_email,
    details,
    severity,
    ip_address,
    user_agent
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    admin_email,
    p_details,
    p_severity,
    inet_client_addr(),
    COALESCE((current_setting('request.headers', true))::json ->> 'user-agent', 'unknown')
  );
EXCEPTION WHEN OTHERS THEN
  -- Fail silently to avoid breaking main operations
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles 
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'viewer');
EXCEPTION WHEN OTHERS THEN
  RETURN 'viewer';
END;
$$;

CREATE OR REPLACE FUNCTION reset_daily_notification_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Reset daily notification counters
  UPDATE public.notification_preferences 
  SET daily_count = 0
  WHERE daily_count > 0;
  
  -- Log reset operation
  INSERT INTO public.system_logs (
    event_type,
    details,
    created_at
  ) VALUES (
    'daily_notification_reset',
    jsonb_build_object('reset_time', NOW()),
    NOW()
  );
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail
  INSERT INTO public.system_logs (
    event_type,
    details,
    severity,
    created_at
  ) VALUES (
    'daily_notification_reset_error',
    jsonb_build_object('error', SQLERRM),
    'error',
    NOW()
  );
END;
$$;

CREATE OR REPLACE FUNCTION user_liked_event(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_event_likes
    WHERE event_id = p_event_id AND user_id = auth.uid()
  );
$$;