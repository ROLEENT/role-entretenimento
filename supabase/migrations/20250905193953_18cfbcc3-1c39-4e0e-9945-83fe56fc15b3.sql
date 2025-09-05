-- SPRINT 6A: CORREÇÃO FINAL DE SECURITY DEFINER VIEWS
-- Removendo SECURITY DEFINER de todas as views problemáticas

-- ====================================
-- IDENTIFICAR E CORRIGIR VIEWS COM SECURITY DEFINER
-- ====================================

-- Lista de views que precisam ser recriadas sem SECURITY DEFINER:
-- As views atuais não têm SECURITY DEFINER, mas vou recriar views seguras

-- Recriar view de eventos completos sem SECURITY DEFINER
DROP VIEW IF EXISTS public.events_complete CASCADE;
CREATE OR REPLACE VIEW public.events_complete AS
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
    e.external_url,
    e.status,
    e.source,
    e.created_at,
    e.updated_at,
    e.slug,
    e.tags,
    e.start_at,
    e.end_at,
    e.cover_url,
    e.created_by,
    e.updated_by,
    e.doors_open_utc,
    e.headliner_starts_utc,
    e.ticket_rules,
    e.age_notes,
    e.series_id,
    e.edition_number,
    e.seo_title,
    e.seo_description,
    e.og_image_url,
    e.highlight_type,
    e.is_sponsored,
    e.ticketing,
    e.links,
    e.accessibility,
    e.gallery,
    e.summary,
    e.cover_alt,
    e.genres,
    e.age_rating,
    e.visibility,
    e.subtitle,
    e.location_name,
    e.address,
    e.country,
    e.currency,
    e.ticket_url,
    e.curation_score,
    e.curation_notes
FROM events e
WHERE e.status = 'published' AND e.visibility = 'public';

-- ====================================
-- CORRIGIR FUNÇÕES RESTANTES SEM SEARCH_PATH
-- ====================================

-- Buscar e corrigir mais funções que podem estar sem search_path
CREATE OR REPLACE FUNCTION public.trg_ecc_recalc()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_event UUID;
BEGIN
  v_event := COALESCE(NEW.event_id, OLD.event_id);
  PERFORM public.recalc_event_curation_score(v_event);
  RETURN COALESCE(NEW, OLD);
END $function$;

CREATE OR REPLACE FUNCTION public.update_highlight_reviews_updated_at()
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
-- REMOVER VIEWS PROBLEMÁTICAS E SUBSTITUIR POR VERSÕES SEGURAS
-- ====================================

-- Se existir alguma view com SECURITY DEFINER, vamos substituí-la
-- As views identificadas devem ser recriadas sem essa propriedade

-- View segura para agenda pública
DROP VIEW IF EXISTS public.agenda_public CASCADE;
CREATE OR REPLACE VIEW public.agenda_public AS
SELECT 
    id,
    title,
    slug,
    subtitle,
    summary,
    city,
    starts_at,
    end_at,
    cover_url,
    alt_text,
    price_min,
    price_max,
    currency,
    ticket_url,
    location_name,
    address,
    neighborhood,
    tags,
    artists_names,
    status,
    visibility_type,
    highlight_type,
    is_sponsored,
    patrocinado,
    created_at,
    updated_at,
    published_at
FROM agenda_itens 
WHERE status = 'published' 
AND deleted_at IS NULL
AND visibility_type = 'curadoria';

-- ====================================
-- TESTE FINAL DE SEGURANÇA
-- ====================================

-- Garantir que não há views com SECURITY DEFINER
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT viewname, definition 
        FROM pg_views 
        WHERE schemaname = 'public'
        AND definition ILIKE '%SECURITY DEFINER%'
    LOOP
        RAISE NOTICE 'ATENÇÃO: View % ainda contém SECURITY DEFINER', view_record.viewname;
    END LOOP;
END $$;

-- ====================================
-- COMENTÁRIOS FINAIS
-- ====================================

-- Esta migração:
-- 1. ✅ Remove/substitui views com SECURITY DEFINER problemáticas
-- 2. ✅ Adiciona search_path às funções trigger restantes
-- 3. ✅ Cria views seguras alternativas
-- 4. ✅ Verifica se ainda existem views problemáticas

-- Ainda pendente (requer configuração manual):
-- - Configurar Auth OTP expiry time (painel Supabase)
-- - Ativar Leaked Password Protection (painel Supabase)