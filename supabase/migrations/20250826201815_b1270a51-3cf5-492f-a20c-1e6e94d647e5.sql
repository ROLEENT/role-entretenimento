-- Create analytics_events table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name text NOT NULL,
  city text,
  referrer text,
  source text DEFAULT 'web',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  page_url text,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "System can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_city ON public.analytics_events(city);
CREATE INDEX IF NOT EXISTS idx_analytics_events_source ON public.analytics_events(source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date_event ON public.analytics_events(created_at, event_name);

-- Create analytics summary view for better performance
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
  date_trunc('day', created_at) as date,
  event_name,
  city,
  source,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.analytics_events
GROUP BY 
  date_trunc('day', created_at),
  event_name,
  city,
  source;

-- Function to get analytics data with filters
CREATE OR REPLACE FUNCTION public.get_analytics_data(
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE,
  p_city text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_event_name text DEFAULT NULL,
  p_limit integer DEFAULT 1000,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  date date,
  event_name text,
  city text,
  source text,
  event_count bigint,
  unique_users bigint,
  unique_sessions bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    s.date::date,
    s.event_name,
    s.city,
    s.source,
    s.event_count,
    s.unique_users,
    s.unique_sessions
  FROM public.analytics_summary s
  WHERE 
    s.date >= p_start_date
    AND s.date <= p_end_date
    AND (p_city IS NULL OR s.city = p_city)
    AND (p_source IS NULL OR s.source = p_source)
    AND (p_event_name IS NULL OR s.event_name = p_event_name)
  ORDER BY s.date DESC, s.event_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- Function to get analytics totals
CREATE OR REPLACE FUNCTION public.get_analytics_totals(
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE,
  p_city text DEFAULT NULL,
  p_source text DEFAULT NULL
)
RETURNS TABLE(
  total_events bigint,
  total_pageviews bigint,
  total_clicks bigint,
  total_conversions bigint,
  unique_users bigint,
  unique_sessions bigint,
  top_cities jsonb,
  top_sources jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE ae.event_name = 'pageview') as total_pageviews,
    COUNT(*) FILTER (WHERE ae.event_name = 'click') as total_clicks,
    COUNT(*) FILTER (WHERE ae.event_name LIKE '%conversion%' OR ae.event_name = 'cta_click') as total_conversions,
    COUNT(DISTINCT ae.user_id) as unique_users,
    COUNT(DISTINCT ae.session_id) as unique_sessions,
    (
      SELECT jsonb_agg(jsonb_build_object('city', city, 'count', count))
      FROM (
        SELECT ae2.city, COUNT(*) as count
        FROM public.analytics_events ae2
        WHERE ae2.created_at >= p_start_date 
          AND ae2.created_at <= p_end_date + INTERVAL '1 day'
          AND ae2.city IS NOT NULL
          AND (p_city IS NULL OR ae2.city = p_city)
          AND (p_source IS NULL OR ae2.source = p_source)
        GROUP BY ae2.city
        ORDER BY count DESC
        LIMIT 10
      ) top_cities_data
    ) as top_cities,
    (
      SELECT jsonb_agg(jsonb_build_object('source', source, 'count', count))
      FROM (
        SELECT ae3.source, COUNT(*) as count
        FROM public.analytics_events ae3
        WHERE ae3.created_at >= p_start_date 
          AND ae3.created_at <= p_end_date + INTERVAL '1 day'
          AND ae3.source IS NOT NULL
          AND (p_city IS NULL OR ae3.city = p_city)
          AND (p_source IS NULL OR ae3.source = p_source)
        GROUP BY ae3.source
        ORDER BY count DESC
        LIMIT 10
      ) top_sources_data
    ) as top_sources
  FROM public.analytics_events ae
  WHERE 
    ae.created_at >= p_start_date
    AND ae.created_at <= p_end_date + INTERVAL '1 day'
    AND (p_city IS NULL OR ae.city = p_city)
    AND (p_source IS NULL OR ae.source = p_source);
END;
$function$;

-- Function to get daily analytics for charts
CREATE OR REPLACE FUNCTION public.get_daily_analytics(
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE,
  p_city text DEFAULT NULL,
  p_source text DEFAULT NULL
)
RETURNS TABLE(
  date date,
  pageviews bigint,
  clicks bigint,
  conversions bigint,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    date_trunc('day', ae.created_at)::date as date,
    COUNT(*) FILTER (WHERE ae.event_name = 'pageview') as pageviews,
    COUNT(*) FILTER (WHERE ae.event_name = 'click') as clicks,
    COUNT(*) FILTER (WHERE ae.event_name LIKE '%conversion%' OR ae.event_name = 'cta_click') as conversions,
    COUNT(DISTINCT ae.user_id) as unique_users
  FROM public.analytics_events ae
  WHERE 
    ae.created_at >= p_start_date
    AND ae.created_at <= p_end_date + INTERVAL '1 day'
    AND (p_city IS NULL OR ae.city = p_city)
    AND (p_source IS NULL OR ae.source = p_source)
  GROUP BY date_trunc('day', ae.created_at)
  ORDER BY date;
END;
$function$;

-- Function to insert analytics event
CREATE OR REPLACE FUNCTION public.track_analytics_event(
  p_event_name text,
  p_city text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_source text DEFAULT 'web',
  p_page_url text DEFAULT NULL,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.analytics_events (
    event_name,
    city,
    referrer,
    source,
    user_id,
    session_id,
    page_url,
    event_data
  )
  VALUES (
    p_event_name,
    p_city,
    p_referrer,
    p_source,
    auth.uid(),
    p_session_id,
    p_page_url,
    p_event_data
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;