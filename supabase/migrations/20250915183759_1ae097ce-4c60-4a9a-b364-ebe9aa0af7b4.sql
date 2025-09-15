-- Correções finais para as tabelas restantes expostas

-- 1. Proteger blog_comments (remover RLS público)
DROP POLICY IF EXISTS "Public can view approved blog comments" ON public.blog_comments;
CREATE POLICY "Anyone can view approved blog comments" 
ON public.blog_comments 
FOR SELECT 
USING (is_approved = true);

-- 2. Proteger perf_metrics e js_errors se ainda não protegidas
DO $$
BEGIN
  -- Verificar se perf_metrics precisa de proteção adicional
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'perf_metrics' 
    AND policyname LIKE '%public%'
  ) THEN
    DROP POLICY IF EXISTS "Public can insert perf_metrics" ON public.perf_metrics;
    DROP POLICY IF EXISTS "Public can view perf_metrics" ON public.perf_metrics;
  END IF;
  
  -- Verificar se js_errors precisa de proteção adicional  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'js_errors' 
    AND policyname LIKE '%public%'
  ) THEN
    DROP POLICY IF EXISTS "Public can insert js_errors" ON public.js_errors;
    DROP POLICY IF EXISTS "Public can view js_errors" ON public.js_errors;
  END IF;
END $$;

-- 3. Proteger event_engagement se existir e ainda não protegida
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_engagement' AND table_schema = 'public') THEN
    -- Verificar se tem políticas públicas para remover
    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'event_engagement' 
      AND policyname LIKE '%public%'
    ) THEN
      DROP POLICY IF EXISTS "Public can view event_engagement" ON public.event_engagement;
      DROP POLICY IF EXISTS "Public can insert event_engagement" ON public.event_engagement;
    END IF;
  END IF;
END $$;

-- 4. Verificar e corrigir app_admins se ainda exposta
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'app_admins' 
    AND policyname = 'app_admins_read_policy'
  ) THEN
    DROP POLICY "app_admins_read_policy" ON public.app_admins;
  END IF;
END $$;

-- 5. Função para verificar status final de segurança
CREATE OR REPLACE FUNCTION public.security_status_report()
RETURNS TABLE(
  table_name text, 
  rls_enabled boolean, 
  public_policies integer, 
  admin_only_policies integer,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pt.tablename::text,
    COALESCE(pc.relrowsecurity, false) as rls_enabled,
    COALESCE(
      (SELECT COUNT(*)::integer FROM pg_policies pp 
       WHERE pp.schemaname = 'public' 
       AND pp.tablename = pt.tablename 
       AND pp.qual ILIKE '%true%'), 0
    ) as public_policies,
    COALESCE(
      (SELECT COUNT(*)::integer FROM pg_policies pp 
       WHERE pp.schemaname = 'public' 
       AND pp.tablename = pt.tablename 
       AND (pp.qual ILIKE '%admin%' OR pp.qual ILIKE '%auth.uid%')), 0
    ) as admin_only_policies,
    CASE 
      WHEN NOT COALESCE(pc.relrowsecurity, false) THEN 'NO_RLS'
      WHEN EXISTS (
        SELECT 1 FROM pg_policies pp 
        WHERE pp.schemaname = 'public' 
        AND pp.tablename = pt.tablename 
        AND pp.qual ILIKE '%true%'
      ) THEN 'PUBLIC_ACCESS'
      ELSE 'SECURE'
    END as status
  FROM pg_tables pt
  LEFT JOIN pg_class pc ON pc.relname = pt.tablename
  WHERE pt.schemaname = 'public'
    AND pt.tablename NOT LIKE 'pg_%'
    AND pt.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  ORDER BY pt.tablename;
END;
$function$;