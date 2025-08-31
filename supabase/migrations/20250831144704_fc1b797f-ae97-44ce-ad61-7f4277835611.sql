-- Fix security definer functions by adding proper search path
CREATE OR REPLACE FUNCTION public.get_audit_history(
  p_table_name text,
  p_record_id uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  admin_email text,
  action text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone,
  ip_address inet,
  user_agent text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    aal.id,
    aal.admin_email,
    aal.action,
    aal.old_values,
    aal.new_values,
    aal.created_at,
    aal.ip_address,
    aal.user_agent
  FROM public.admin_audit_log aal
  WHERE aal.table_name = p_table_name 
    AND aal.record_id = p_record_id
    AND (EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    ))
  ORDER BY aal.created_at DESC
  LIMIT p_limit;
$$;

-- Fix get_recent_audit_activity function
CREATE OR REPLACE FUNCTION public.get_recent_audit_activity(
  p_admin_email text DEFAULT NULL,
  p_table_name text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  admin_email text,
  action text,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone,
  ip_address inet,
  user_agent text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    aal.id,
    aal.admin_email,
    aal.action,
    aal.table_name,
    aal.record_id,
    aal.old_values,
    aal.new_values,
    aal.created_at,
    aal.ip_address,
    aal.user_agent
  FROM public.admin_audit_log aal
  WHERE (p_admin_email IS NULL OR aal.admin_email = p_admin_email)
    AND (p_table_name IS NULL OR aal.table_name = p_table_name)
    AND (EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    ))
  ORDER BY aal.created_at DESC
  LIMIT p_limit;
$$;

-- Fix get_audit_statistics function
CREATE OR REPLACE FUNCTION public.get_audit_statistics(
  p_start_date timestamp with time zone DEFAULT (now() - interval '30 days'),
  p_end_date timestamp with time zone DEFAULT now()
)
RETURNS TABLE(
  total_actions bigint,
  total_admins bigint,
  actions_by_type jsonb,
  actions_by_table jsonb,
  actions_by_admin jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*) as total_actions,
    COUNT(DISTINCT aal.admin_email) as total_admins,
    jsonb_object_agg(DISTINCT aal.action, action_stats.action_count) as actions_by_type,
    jsonb_object_agg(DISTINCT aal.table_name, table_stats.table_count) as actions_by_table,
    jsonb_object_agg(DISTINCT aal.admin_email, admin_stats.admin_count) as actions_by_admin
  FROM public.admin_audit_log aal
  LEFT JOIN (
    SELECT action, COUNT(*) as action_count
    FROM public.admin_audit_log
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY action
  ) action_stats ON aal.action = action_stats.action
  LEFT JOIN (
    SELECT table_name, COUNT(*) as table_count
    FROM public.admin_audit_log
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY table_name
  ) table_stats ON aal.table_name = table_stats.table_name
  LEFT JOIN (
    SELECT admin_email, COUNT(*) as admin_count
    FROM public.admin_audit_log
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY admin_email
  ) admin_stats ON aal.admin_email = admin_stats.admin_email
  WHERE aal.created_at BETWEEN p_start_date AND p_end_date;
END;
$$;