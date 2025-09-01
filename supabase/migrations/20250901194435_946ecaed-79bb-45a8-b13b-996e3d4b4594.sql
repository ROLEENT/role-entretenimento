-- Fase 3: Remover views Security Definer restantes (não-admin)
-- Identificando e removendo as views problemáticas que não são críticas para admin

-- 1. Remover views Security Definer - agenda_public (já existe uma versão normal)
-- Esta view já foi recriada sem SECURITY DEFINER anteriormente

-- 2. Remover view agentes - não parece crítica para admin
DROP VIEW IF EXISTS public.agentes CASCADE;

-- 3. Remover view analytics_summary - já existe versão sem SECURITY DEFINER
-- Esta view já foi recriada anteriormente

-- 4. Verificar e ajustar outras views se necessário
DROP VIEW IF EXISTS public.cities_other_counts CASCADE;
DROP VIEW IF EXISTS public.profiles_with_stats CASCADE;
DROP VIEW IF EXISTS public.v_admin_dashboard_counts CASCADE;

-- 5. Recriar views básicas sem Security Definer quando necessário
CREATE VIEW public.cities_other_counts AS
SELECT 
  city AS city_name,
  count(*) AS events_count
FROM public.agenda_itens
WHERE status = 'published'::agenda_status 
  AND deleted_at IS NULL
GROUP BY city
HAVING city IS NOT NULL
ORDER BY count(*) DESC;