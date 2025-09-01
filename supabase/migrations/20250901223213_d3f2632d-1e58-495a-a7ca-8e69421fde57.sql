-- Fix the analytics_summary view error - it's a regular view, not materialized
-- Drop and recreate it as a regular view with SECURITY INVOKER

DROP VIEW IF EXISTS public.analytics_summary CASCADE;
CREATE VIEW public.analytics_summary 
WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as date,
  event_name,
  source,
  city,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users
FROM public.analytics_events
GROUP BY DATE(created_at), event_name, source, city;