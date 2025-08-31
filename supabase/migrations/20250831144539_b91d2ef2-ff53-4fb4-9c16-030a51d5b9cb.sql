-- Create comprehensive audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  admin_email_header text;
  old_data jsonb;
  new_data jsonb;
BEGIN
  -- Get admin email from request headers
  admin_email_header := current_setting('request.headers', true)::json->>'x-admin-email';
  
  -- Skip if no admin email in headers (system operations)
  IF admin_email_header IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Prepare old and new data
  old_data := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  new_data := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END;

  -- Insert audit record
  INSERT INTO public.admin_audit_log (
    admin_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    admin_email_header,
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN (OLD.id)::uuid
      ELSE (NEW.id)::uuid
    END,
    old_data,
    new_data,
    (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet,
    current_setting('request.headers', true)::json->>'user-agent'
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the operation
  RAISE WARNING 'Audit trigger failed: %', SQLERRM;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE OR REPLACE FUNCTION public.setup_audit_triggers()
RETURNS void AS $$
DECLARE
  table_name text;
  audit_tables text[] := ARRAY[
    'artists',
    'events', 
    'agenda_itens',
    'organizers',
    'partners',
    'venues',
    'blog_posts',
    'highlights',
    'advertisements',
    'categories',
    'admin_users',
    'approved_admins'
  ];
BEGIN
  FOREACH table_name IN ARRAY audit_tables
  LOOP
    -- Drop existing trigger if exists
    EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON public.%I', table_name);
    
    -- Create audit trigger for each table
    EXECUTE format('
      CREATE TRIGGER audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function()
    ', table_name);
    
    RAISE NOTICE 'Created audit trigger for table: %', table_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the setup
SELECT public.setup_audit_triggers();

-- Create function to get audit history for a record
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
  ORDER BY aal.created_at DESC
  LIMIT p_limit;
$$;

-- Create function to get recent audit activity
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
  ORDER BY aal.created_at DESC
  LIMIT p_limit;
$$;

-- Create function to get audit statistics
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
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*) as total_actions,
    COUNT(DISTINCT admin_email) as total_admins,
    jsonb_object_agg(action, action_count) as actions_by_type,
    jsonb_object_agg(table_name, table_count) as actions_by_table,
    jsonb_object_agg(admin_email, admin_count) as actions_by_admin
  FROM (
    SELECT 
      action,
      COUNT(*) as action_count,
      table_name,
      COUNT(*) OVER (PARTITION BY table_name) as table_count,
      admin_email,
      COUNT(*) OVER (PARTITION BY admin_email) as admin_count
    FROM public.admin_audit_log
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY action, table_name, admin_email
  ) stats;
$$;