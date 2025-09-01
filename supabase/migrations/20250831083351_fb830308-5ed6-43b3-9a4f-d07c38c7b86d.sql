-- CORREÇÃO CRÍTICA: Corrigir views SECURITY DEFINER com tabelas existentes

-- 1. Recriar view v_admin_dashboard_counts sem SECURITY DEFINER usando tabelas existentes
DROP VIEW IF EXISTS public.v_admin_dashboard_counts;
CREATE VIEW public.v_admin_dashboard_counts AS
  -- Contatos
  SELECT 'contacts' as kind,
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_7d
  FROM public.contacts
  UNION ALL
  
  -- Newsletter (usando contact_messages como proxy)
  SELECT 'newsletter' as kind,
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_7d
  FROM public.contact_messages
  WHERE subject ILIKE '%newsletter%' OR message ILIKE '%newsletter%'
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
  starts_at as start_at, end_at, city, status, visibility_type,
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

-- 5. Habilitar RLS nas tabelas reais restantes (agenda_media, agenda_occurrences, etc)
ALTER TABLE public.agenda_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_slug_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_ticket_tiers ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas para essas tabelas
CREATE POLICY "Public can view published agenda media" ON public.agenda_media
FOR SELECT USING (true);

CREATE POLICY "Admins can manage agenda media" ON public.agenda_media
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Public can view agenda occurrences" ON public.agenda_occurrences
FOR SELECT USING (true);

CREATE POLICY "Admins can manage agenda occurrences" ON public.agenda_occurrences
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Admins can view agenda slug history" ON public.agenda_slug_history
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Public can view ticket tiers" ON public.agenda_ticket_tiers
FOR SELECT USING (true);

CREATE POLICY "Admins can manage ticket tiers" ON public.agenda_ticket_tiers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);