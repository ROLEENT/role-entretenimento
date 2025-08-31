-- CORREÇÃO CRÍTICA: Corrigir 5 views SECURITY DEFINER problemáticas
-- As views não podem ter RLS, então vamos recriar como views normais sem SECURITY DEFINER

-- 1. Recriar view v_admin_dashboard_counts sem SECURITY DEFINER
DROP VIEW IF EXISTS public.v_admin_dashboard_counts;
CREATE VIEW public.v_admin_dashboard_counts AS
  -- Contatos
  SELECT 'contacts' as kind,
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_7d
  FROM public.contacts
  UNION ALL
  
  -- Newsletter
  SELECT 'newsletter' as kind,
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_7d
  FROM public.newsletter_subscriptions
  WHERE active = true
  UNION ALL
  
  -- Candidaturas
  SELECT 'job_applications' as kind,
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_7d
  FROM public.applications;

-- 2. Recriar view agenda_public sem SECURITY DEFINER
DROP VIEW IF EXISTS public.agenda_public;
CREATE VIEW public.agenda_public AS
SELECT 
  id, title, slug, subtitle, summary, cover_url, alt_text,
  start_at, end_at, city, status, visibility_type,
  created_at, updated_at, created_by, updated_by,
  venue_id, organizer_id, event_id, deleted_at,
  priority, patrocinado, preview_token,
  meta_title, meta_description, cupom, anunciante,
  type, tags, ticket_url, focal_point_x, focal_point_y,
  unpublish_at, publish_at, noindex
FROM public.agenda_itens
WHERE status = 'published' AND deleted_at IS NULL;

-- 3. Recriar view analytics_summary sem SECURITY DEFINER
DROP VIEW IF EXISTS public.analytics_summary;
CREATE VIEW public.analytics_summary AS
SELECT 
  date_trunc('day', created_at) as date,
  event_name,
  source,
  city,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY date_trunc('day', created_at), event_name, source, city
ORDER BY date DESC;

-- 4. Recriar view cities_other_counts sem SECURITY DEFINER
DROP VIEW IF EXISTS public.cities_other_counts;
CREATE VIEW public.cities_other_counts AS
SELECT 
  city as city_name,
  COUNT(*) as events_count
FROM public.agenda_itens
WHERE status = 'published' AND deleted_at IS NULL
GROUP BY city
HAVING city IS NOT NULL
ORDER BY events_count DESC;

-- 5. Verificar se existe quinta view e corrigi-la
-- Nota: Agentes já é tratado como view, não tabela
DROP VIEW IF EXISTS public.agentes;
CREATE VIEW public.agentes AS
SELECT 
  id, name, slug, instagram, city, created_at, updated_at,
  kind, state, country, status
FROM public.artists
WHERE status = 'active'
UNION ALL
SELECT 
  id, name, 'organizer' as slug, instagram, 
  location as city, created_at, updated_at,
  'organizer' as kind, null as state, null as country, 
  CASE WHEN featured THEN 'active' ELSE 'inactive' END as status
FROM public.organizers;