-- Corrigir issues críticos de RLS
-- Primeiro, remover views problemáticas SECURITY DEFINER e criar RLS policies adequadas

-- 1. Dropar views problemáticas que estão causando bypass de RLS
DROP VIEW IF EXISTS public.agenda_public;
DROP VIEW IF EXISTS public.analytics_summary;

-- 2. Adicionar SET search_path em todas as functions para segurança
-- As functions já existem, vamos apenas adicionar o search_path onde falta

-- 3. Recriar view agenda_public como view normal (sem SECURITY DEFINER)
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

-- 4. Criar RLS policy para agenda_public
ALTER TABLE public.agenda_itens ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública de itens publicados (já existe, mas garantindo)
CREATE POLICY IF NOT EXISTS "agenda_public_read_published" 
ON public.agenda_itens FOR SELECT 
USING (
  status = 'published' 
  AND deleted_at IS NULL 
  AND (publish_at IS NULL OR publish_at <= NOW())
  AND (unpublish_at IS NULL OR unpublish_at > NOW())
);

-- 5. Garantir que analytics_summary seja apenas uma view de leitura
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

-- 6. Garantir RLS está habilitado em tabelas críticas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy para admin_users - apenas admin autenticado pode ver
CREATE POLICY IF NOT EXISTS "admin_users_secure_read" 
ON public.admin_users FOR SELECT 
USING (
  email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
  AND is_active = true
);

-- Policy para admin_sessions - apenas próprias sessões
CREATE POLICY IF NOT EXISTS "admin_sessions_own_only" 
ON public.admin_sessions FOR ALL 
USING (
  admin_id IN (
    SELECT id FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- 7. Garantir que functions críticas tenham SET search_path
-- Isso será feito através de ALTER FUNCTION para cada uma

-- Function para validar admin de forma segura
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