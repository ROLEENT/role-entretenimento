-- Criar view do dashboard
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

-- Atualizar apenas as funções críticas com SET search_path
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