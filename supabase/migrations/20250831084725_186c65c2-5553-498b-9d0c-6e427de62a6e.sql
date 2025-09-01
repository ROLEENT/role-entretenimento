-- Create system logs table
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view logs
CREATE POLICY "Admins can view system logs" ON public.system_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- Create backup metadata table
CREATE TABLE IF NOT EXISTS public.backup_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_size BIGINT,
  backup_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS for backup metadata
ALTER TABLE public.backup_metadata ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage backups
CREATE POLICY "Admins can manage backups" ON public.backup_metadata
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- Create push notification subscriptions for admins
CREATE TABLE IF NOT EXISTS public.admin_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for admin push subscriptions
ALTER TABLE public.admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage their own push subscriptions
CREATE POLICY "Admins can manage their push subscriptions" ON public.admin_push_subscriptions
FOR ALL USING (
  admin_email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
  AND EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = admin_email AND is_active = true
  )
);

-- Create RPC function to get system logs
CREATE OR REPLACE FUNCTION public.get_system_logs(
  p_admin_email TEXT,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  admin_email TEXT,
  action TEXT,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin not found or inactive';
  END IF;

  RETURN QUERY
  SELECT 
    sl.id,
    sl.admin_email,
    sl.action,
    sl.table_name,
    sl.record_id,
    sl.old_values,
    sl.new_values,
    sl.ip_address,
    sl.user_agent,
    sl.created_at
  FROM public.system_logs sl
  ORDER BY sl.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create RPC function to get analytics summary
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  p_admin_email TEXT,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_events INTEGER,
  published_events INTEGER,
  draft_events INTEGER,
  total_artists INTEGER,
  total_venues INTEGER,
  total_organizers INTEGER,
  page_views BIGINT,
  unique_visitors BIGINT,
  top_events JSONB,
  popular_cities JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result_row RECORD;
BEGIN
  -- Verify admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin not found or inactive';
  END IF;

  -- Get basic stats
  SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE status = 'published') as published_events,
    COUNT(*) FILTER (WHERE status = 'draft') as draft_events
  INTO result_row
  FROM public.agenda_itens
  WHERE created_at >= p_start_date AND created_at <= p_end_date + INTERVAL '1 day';

  RETURN QUERY
  SELECT 
    result_row.total_events::INTEGER,
    result_row.published_events::INTEGER,
    result_row.draft_events::INTEGER,
    (SELECT COUNT(*)::INTEGER FROM public.artists WHERE status = 'active'),
    (SELECT COUNT(*)::INTEGER FROM public.venues),
    (SELECT COUNT(*)::INTEGER FROM public.organizers),
    COALESCE((SELECT SUM(event_count) FROM public.analytics_summary WHERE date >= p_start_date), 0)::BIGINT,
    COALESCE((SELECT SUM(unique_users) FROM public.analytics_summary WHERE date >= p_start_date), 0)::BIGINT,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', title,
          'views', COALESCE(views, 0)
        )
      )
      FROM (
        SELECT title, views
        FROM public.agenda_itens 
        WHERE status = 'published' 
        ORDER BY views DESC NULLS LAST 
        LIMIT 5
      ) t
    ),
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'city', city,
          'count', count
        )
      )
      FROM (
        SELECT city, COUNT(*) as count
        FROM public.agenda_itens 
        WHERE created_at >= p_start_date 
        AND city IS NOT NULL
        GROUP BY city
        ORDER BY count DESC
        LIMIT 5
      ) t
    );
END;
$$;

-- Create RPC function to create system backup
CREATE OR REPLACE FUNCTION public.create_system_backup(
  p_admin_email TEXT,
  p_backup_type TEXT DEFAULT 'full'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  backup_id UUID;
BEGIN
  -- Verify admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin not found or inactive';
  END IF;

  -- Create backup record
  INSERT INTO public.backup_metadata (
    filename,
    backup_type,
    status,
    admin_email
  ) VALUES (
    'backup_' || p_backup_type || '_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS') || '.sql',
    p_backup_type,
    'pending',
    p_admin_email
  ) RETURNING id INTO backup_id;

  RETURN backup_id;
END;
$$;