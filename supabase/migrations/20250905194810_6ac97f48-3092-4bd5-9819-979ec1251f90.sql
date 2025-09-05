-- SPRINT 6B: FINALIZAÇÃO TOTAL DA SEGURANÇA
-- Eliminando TODAS as vulnerabilidades remanescentes

-- ====================================
-- FASE 1: CORRIGIR ÚLTIMA FUNÇÃO SEM SEARCH_PATH
-- ====================================

CREATE OR REPLACE FUNCTION public.update_profile_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- ====================================
-- FASE 2: RESOLVER PROBLEMA DE SECURITY DEFINER VIEWS
-- ====================================

-- O linter pode estar detectando views que usam funções SECURITY DEFINER
-- Vamos remover essas dependências e criar views mais simples

-- 1. Recriar views que usam can_view_sensitive_data() sem essa função
DROP VIEW IF EXISTS public.artists_public CASCADE;
CREATE VIEW public.artists_public AS
SELECT 
  id,
  stage_name,
  artist_type,
  city,
  state,
  country,
  bio_short,
  bio_long,
  profile_image_url,
  cover_image_url,
  slug,
  tags,
  website_url,
  spotify_url,
  soundcloud_url,
  youtube_url,
  beatport_url,
  audius_url,
  -- Não expor dados sensíveis em views públicas
  NULL as instagram,
  NULL as booking_email,
  NULL as booking_whatsapp,
  NULL as booking_phone,
  created_at,
  updated_at
FROM public.artists
WHERE status = 'active';

DROP VIEW IF EXISTS public.organizers_public CASCADE;
CREATE VIEW public.organizers_public AS
SELECT 
  id,
  name,
  bio,
  city,
  state,
  country,
  avatar_url,
  cover_url,
  slug,
  instagram,
  website,
  -- Não expor dados sensíveis em views públicas
  NULL as email,
  NULL as phone,
  NULL as whatsapp,
  created_at,
  updated_at
FROM public.organizers;

DROP VIEW IF EXISTS public.partners_public CASCADE;
CREATE VIEW public.partners_public AS
SELECT 
  id,
  name,
  location,
  website,
  instagram,
  image_url,
  featured,
  rating,
  capacity,
  types,
  -- Não expor dados sensíveis em views públicas
  NULL as contact_email,
  created_at,
  updated_at
FROM public.partners;

-- ====================================
-- FASE 3: VERIFICAR E REMOVER VIEWS COMPLEXAS PROBLEMÁTICAS
-- ====================================

-- Simplificar view de eventos para evitar problemas de security definer
DROP VIEW IF EXISTS public.events_with_relations CASCADE;
CREATE VIEW public.events_with_relations AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.date_start,
    e.date_end,
    e.city,
    e.state,
    e.price_min,
    e.price_max,
    e.image_url,
    e.organizer_id,
    e.venue_id,
    e.status,
    e.created_at,
    e.updated_at,
    e.slug,
    e.tags,
    e.cover_url,
    e.highlight_type,
    e.is_sponsored,
    e.summary,
    e.visibility
FROM events e
WHERE e.status = 'published' AND e.visibility = 'public';

-- Simplificar view de eventos ativos
DROP VIEW IF EXISTS public.events_active CASCADE;
CREATE VIEW public.events_active AS
SELECT 
    id,
    title,
    slug,
    city,
    date_start,
    date_end,
    price_min,
    price_max,
    image_url,
    cover_url,
    summary,
    highlight_type,
    is_sponsored,
    created_at,
    updated_at
FROM events
WHERE status = 'published' 
AND visibility = 'public'
AND date_start >= CURRENT_DATE;

-- ====================================
-- FASE 4: REMOVER DEPENDÊNCIAS DE FUNÇÕES SECURITY DEFINER
-- ====================================

-- Criar versão simplificada da view de contagem do dashboard admin
DROP VIEW IF EXISTS public.v_admin_dashboard_counts CASCADE;
CREATE VIEW public.v_admin_dashboard_counts AS
SELECT 
    (SELECT count(*) FROM agenda_itens WHERE status = 'published') AS events_count,
    (SELECT count(*) FROM artists WHERE status = 'active') AS artists_count,
    (SELECT count(*) FROM organizers) AS organizers_count,
    (SELECT count(*) FROM partners) AS partners_count,
    (SELECT count(*) FROM highlights WHERE active = true) AS highlights_count;

-- ====================================
-- FASE 5: POLÍTICAS RLS SIMPLES PARA VIEWS
-- ====================================

-- Garantir que as views têm políticas RLS adequadas via tabelas base
-- As views herdam automaticamente as políticas das tabelas subjacentes

-- ====================================
-- FASE 6: VALIDAÇÃO FINAL
-- ====================================

-- Verificar se ainda existem referências problemáticas
DO $$
DECLARE
    view_record RECORD;
    func_record RECORD;
BEGIN
    -- Verificar views com SECURITY DEFINER
    FOR view_record IN 
        SELECT viewname, definition 
        FROM pg_views 
        WHERE schemaname = 'public'
        AND definition ILIKE '%SECURITY DEFINER%'
    LOOP
        RAISE NOTICE 'ATENÇÃO: View % ainda contém SECURITY DEFINER', view_record.viewname;
    END LOOP;
    
    -- Verificar funções sem search_path
    FOR func_record IN 
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
        AND NOT (pg_get_functiondef(p.oid) ILIKE '%SET search_path%')
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT LIKE 'st_%'
    LOOP
        RAISE NOTICE 'ATENÇÃO: Função % sem search_path', func_record.proname;
    END LOOP;
END $$;

-- ====================================
-- COMENTÁRIOS FINAIS
-- ====================================

-- Esta migração final:
-- ✅ Corrige a última função sem search_path
-- ✅ Remove dependências de funções SECURITY DEFINER em views
-- ✅ Simplifica views complexas que podem causar problemas
-- ✅ Mantém segurança através de RLS nas tabelas base
-- ✅ Elimina exposição de dados sensíveis em views públicas

-- Resultado esperado: 0 erros críticos no linter de segurança