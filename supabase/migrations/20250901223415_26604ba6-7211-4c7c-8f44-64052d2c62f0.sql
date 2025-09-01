-- Fix the cities_other_counts view that wasn't addressed before
-- This might be the remaining Security Definer View

DROP VIEW IF EXISTS public.cities_other_counts CASCADE;
CREATE VIEW public.cities_other_counts 
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

-- Let's also check if there are any database functions that might be creating views
-- and need to be updated to use SECURITY INVOKER by default

-- Ensure all our views explicitly use SECURITY INVOKER
ALTER VIEW public.agenda_public SET (security_invoker = true);
ALTER VIEW public.analytics_summary SET (security_invoker = true);
ALTER VIEW public.profiles_with_stats SET (security_invoker = true);
ALTER VIEW public.cities_other_counts SET (security_invoker = true);