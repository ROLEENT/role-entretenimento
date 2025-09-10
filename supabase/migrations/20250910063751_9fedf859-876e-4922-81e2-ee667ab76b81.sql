-- Corrigir Views Security Definer - Com enum correto

-- 1. Remover views problemáticas e recriar sem SECURITY DEFINER
DROP VIEW IF EXISTS public.v_admin_dashboard_counts;
DROP VIEW IF EXISTS public.agenda_events_public;

-- 2. Recriar view admin dashboard sem SECURITY DEFINER
CREATE OR REPLACE VIEW public.v_admin_dashboard_counts AS
SELECT 
  (SELECT COUNT(*) FROM public.agenda_itens WHERE status = 'published') as published_events,
  (SELECT COUNT(*) FROM public.agenda_itens WHERE status = 'draft') as draft_events,
  (SELECT COUNT(*) FROM public.artists WHERE status = 'active') as active_artists,
  (SELECT COUNT(*) FROM public.organizers WHERE status = 'active') as active_organizers,
  (SELECT COUNT(*) FROM public.venues WHERE status = 'active') as active_venues,
  (SELECT COUNT(*) FROM public.highlights WHERE status = 'published') as published_highlights,
  (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published') as published_posts;

-- 3. Recriar view agenda_events_public com enum correto
CREATE OR REPLACE VIEW public.agenda_events_public AS
SELECT 
  ai.id,
  ai.title,
  ai.subtitle,
  ai.summary,
  ai.slug,
  ai.cover_url,
  ai.alt_text,
  ai.city,
  ai.location_name,
  ai.address,
  ai.neighborhood,
  ai.starts_at,
  ai.end_at,
  ai.price_min,
  ai.price_max,
  ai.currency,
  ai.ticket_url,
  ai.highlight_type,
  ai.is_sponsored,
  ai.patrocinado,
  ai.status,
  ai.visibility_type,
  ai.tags,
  ai.artists_names,
  ai.created_at,
  ai.updated_at,
  ai.published_at
FROM public.agenda_itens ai
WHERE ai.status = 'published' 
  AND ai.deleted_at IS NULL
  AND ai.visibility_type = 'curadoria';

-- 4. Comentários sobre segurança das views
COMMENT ON VIEW public.v_admin_dashboard_counts IS 'Dashboard metrics - secured by underlying table RLS policies';
COMMENT ON VIEW public.agenda_events_public IS 'Public events view - access controlled by base table RLS';