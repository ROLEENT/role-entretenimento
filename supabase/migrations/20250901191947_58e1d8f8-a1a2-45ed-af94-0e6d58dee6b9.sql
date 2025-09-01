-- Corrigir RLS crítico (corrigindo sintaxe)
-- Dropar views problemáticas e recriar com segurança adequada

-- 1. Remover views Security Definer problemáticas
DROP VIEW IF EXISTS public.agenda_public CASCADE;
DROP VIEW IF EXISTS public.analytics_summary CASCADE;

-- 2. Recriar agenda_public como view normal (sem SECURITY DEFINER)
CREATE VIEW public.agenda_public AS
SELECT 
  ai.id,
  ai.title,
  ai.subtitle, 
  ai.summary,
  ai.slug,
  ai.status,
  ai.visibility_type,
  ai.starts_at,
  ai.end_at,
  ai.city,
  ai.address,
  ai.location_name,
  ai.neighborhood,
  ai.price_min,
  ai.price_max,
  ai.currency,
  ai.ticket_url,
  ai.cover_url,
  ai.alt_text,
  ai.focal_point_x,
  ai.focal_point_y,
  ai.tags,
  ai.type,
  ai.age_rating,
  ai.meta_title,
  ai.meta_description,
  ai.canonical_url,
  ai.noindex,
  ai.priority,
  ai.patrocinado,
  ai.anunciante,
  ai.cupom,
  ai.event_id,
  ai.venue_id,
  ai.organizer_id,
  ai.created_at,
  ai.updated_at,
  ai.publish_at,
  ai.unpublish_at,
  ai.deleted_at,
  ai.preview_token,
  ai.created_by,
  ai.updated_by
FROM public.agenda_itens ai
WHERE ai.status = 'published' 
  AND ai.deleted_at IS NULL
  AND (ai.publish_at IS NULL OR ai.publish_at <= NOW())
  AND (ai.unpublish_at IS NULL OR ai.unpublish_at > NOW());

-- 3. Garantir RLS na view agenda_public
COMMENT ON VIEW public.agenda_public IS 'Public view of published agenda items - inherits RLS from agenda_itens';

-- 4. Recriar analytics_summary sem Security Definer  
CREATE VIEW public.analytics_summary AS
SELECT 
  DATE(ae.created_at) as date,
  ae.event_name,
  ae.source,
  ae.city,
  COUNT(*) as event_count,
  COUNT(DISTINCT ae.session_id) as unique_sessions,
  COUNT(DISTINCT ae.user_id) as unique_users
FROM public.analytics_events ae
WHERE ae.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ae.created_at), ae.event_name, ae.source, ae.city
ORDER BY date DESC;

-- 5. Criar função segura para validação de admin
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  ) AND EXISTS(
    SELECT 1 FROM public.approved_admins
    WHERE email = session_email AND is_active = true
  )
$$;

-- 6. Garantir RLS habilitado em tabelas críticas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;