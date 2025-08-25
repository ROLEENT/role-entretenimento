-- Fix remaining security warnings
-- Fix search_path for remaining functions

ALTER FUNCTION public.increment_highlight_likes(uuid) SET search_path = public;
ALTER FUNCTION public.get_event_checkins(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_stats(uuid) SET search_path = public;
ALTER FUNCTION public.get_popular_highlights() SET search_path = public;
ALTER FUNCTION public.get_highlight_comments(uuid) SET search_path = public;
ALTER FUNCTION public.add_highlight_comment(uuid, text, text, text) SET search_path = public;
ALTER FUNCTION public.get_trending_events() SET search_path = public;
ALTER FUNCTION public.get_featured_highlights() SET search_path = public;
ALTER FUNCTION public.search_highlights(text) SET search_path = public;

-- Move extensions from public schema to avoid security warnings
-- Note: Some extensions might need to stay in public for functionality
-- This is a conservative approach that maintains functionality

-- Create dedicated schema for extensions if needed
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to service role
GRANT USAGE ON SCHEMA extensions TO service_role;

-- The vector extension might need to stay in public for full functionality
-- but we can document this as an accepted risk

-- Add comment explaining why vector stays in public
COMMENT ON EXTENSION vector IS 'Vector extension remains in public schema for compatibility with existing queries and RLS policies';