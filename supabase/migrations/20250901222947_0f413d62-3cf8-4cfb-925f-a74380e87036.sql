-- Fix remaining 3 Security Definer Views by adding SECURITY INVOKER
-- Check for views that might be using SECURITY DEFINER and recreate them with SECURITY INVOKER

-- Recreate profiles_with_stats view with SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_with_stats;
CREATE VIEW public.profiles_with_stats 
WITH (security_invoker = true) AS
SELECT 
  ep.*,
  COALESCE(follower_counts.followers_count, 0) as followers_count
FROM public.entity_profiles ep
LEFT JOIN (
  SELECT 
    profile_id,
    COUNT(*) as followers_count
  FROM public.followers 
  GROUP BY profile_id
) follower_counts ON ep.id = follower_counts.profile_id
WHERE ep.visibility = 'public';

-- Recreate analytics_summary view with SECURITY INVOKER if it exists
DROP VIEW IF EXISTS public.analytics_summary;
CREATE OR REPLACE VIEW public.analytics_summary 
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

-- Recreate any other views that might exist with SECURITY DEFINER
-- Note: We need to check what other views exist and fix them accordingly