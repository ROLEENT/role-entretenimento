-- 1. Add slug column to artists table
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS slug text;

-- 2. Generate slugs from stage_name for existing records
UPDATE public.artists 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      unaccent(coalesce(stage_name, 'artista-' || id::text)), 
      '[^a-zA-Z0-9\s-]', '', 'g'
    ), 
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- 3. Make slug NOT NULL and UNIQUE
ALTER TABLE public.artists ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS artists_slug_key ON public.artists (slug);

-- 4. Drop existing function first
DROP FUNCTION IF EXISTS public.get_recent_activity();

-- 5. Create new get_recent_activity function with correct signature
CREATE OR REPLACE FUNCTION public.get_recent_activity()
RETURNS TABLE(
  kind text, 
  id uuid, 
  name text,
  updated_at timestamp with time zone
)
LANGUAGE sql 
SECURITY DEFINER 
STABLE
AS $$
  SELECT 
    'artist'::text as kind, 
    a.id, 
    a.stage_name as name, 
    a.updated_at
  FROM public.artists a
  WHERE a.status = 'active'
  
  UNION ALL
  
  SELECT 
    'agenda'::text as kind, 
    ai.id, 
    ai.title as name, 
    ai.updated_at
  FROM public.agenda_itens ai
  WHERE ai.status = 'published'
  
  ORDER BY updated_at DESC
  LIMIT 20;
$$;

-- 6. Create v_admin_dashboard_counts view
CREATE OR REPLACE VIEW public.v_admin_dashboard_counts AS
SELECT
  (SELECT count(*) FROM public.agenda_itens WHERE status = 'published') as events_count,
  (SELECT count(*) FROM public.artists WHERE status = 'active') as artists_count,
  (SELECT count(*) FROM public.venues WHERE status = 'active') as venues_count,
  (SELECT count(*) FROM public.organizers) as organizers_count;

-- 7. Grant permissions
GRANT SELECT ON public.v_admin_dashboard_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_activity() TO anon, authenticated;

-- 8. Reload PostgREST schema
NOTIFY pgrst, 'reload schema';