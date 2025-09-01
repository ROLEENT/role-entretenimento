-- Fix the last Security Definer View error
-- Let's check for any remaining views and recreate them with SECURITY INVOKER

-- Check if there are any views in the database that might be using SECURITY DEFINER
-- and recreate them with SECURITY INVOKER

-- Recreate cities_with_event_count view if it exists with SECURITY INVOKER
DROP VIEW IF EXISTS public.cities_with_event_count;
CREATE VIEW public.cities_with_event_count 
WITH (security_invoker = true) AS
SELECT 
  ai.city as city_name,
  COUNT(*) as events_count
FROM public.agenda_itens ai
WHERE ai.status = 'published'::agenda_status 
  AND ai.deleted_at IS NULL
  AND ai.city IS NOT NULL
GROUP BY ai.city
ORDER BY events_count DESC;

-- Recreate any other materialized views or views that might exist
-- Note: analytics_summary is already materialized, let's recreate it as well
DROP MATERIALIZED VIEW IF EXISTS public.analytics_summary CASCADE;
CREATE MATERIALIZED VIEW public.analytics_summary AS
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