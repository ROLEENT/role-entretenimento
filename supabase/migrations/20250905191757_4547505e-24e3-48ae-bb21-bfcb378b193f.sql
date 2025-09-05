-- Corrigir funções restantes sem search_path

-- Corrigir create_event_cascade
ALTER FUNCTION public.create_event_cascade(jsonb, jsonb, jsonb, jsonb, jsonb) SET search_path = public;

-- Corrigir upsert_event_criteria
ALTER FUNCTION public.upsert_event_criteria(uuid, text, jsonb) SET search_path = public;

-- Corrigir recalc_event_curation_score
ALTER FUNCTION public.recalc_event_curation_score(uuid) SET search_path = public;

-- Corrigir get_recent_activity
ALTER FUNCTION public.get_recent_activity() SET search_path = public;

-- Vamos também verificar se existem views problemáticas e remover SECURITY DEFINER delas
-- Como as views não foram encontradas na query anterior, vamos procurar no information_schema

-- Criar uma função para listar views com SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.find_security_definer_views()
RETURNS TABLE(view_name text, view_definition text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    table_name::text,
    view_definition::text
  FROM information_schema.views 
  WHERE table_schema = 'public'
  AND view_definition ILIKE '%SECURITY DEFINER%'
$$;