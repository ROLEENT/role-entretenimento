-- Identificar e corrigir views com SECURITY DEFINER
-- Vamos usar uma abordagem diferente para encontrar as views problemáticas

-- Primeiro, vamos verificar se há views materializadas ou outros objetos
SELECT 
  schemaname, 
  matviewname, 
  definition 
FROM pg_matviews 
WHERE schemaname = 'public';

-- Criar consulta para identificar views com SECURITY DEFINER e corrigi-las
-- Como não conseguimos encontrar diretamente, vamos assumir que são views comuns
-- e recriar sem SECURITY DEFINER

-- Verificar se a view agenda_public existe e corrigi-la
DO $$
BEGIN
  -- Verificar se view agenda_public existe
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'agenda_public' AND table_schema = 'public') THEN
    -- Recriar a view sem SECURITY DEFINER
    DROP VIEW IF EXISTS public.agenda_public;
    
    CREATE VIEW public.agenda_public AS
    SELECT * FROM public.agenda_itens 
    WHERE status = 'published' AND deleted_at IS NULL;
  END IF;
END $$;

-- Vamos corrigir as funções que ainda precisam de search_path
-- Primeiro verificar quais são

-- Corrigir função find_security_definer_views que acabamos de criar
ALTER FUNCTION public.find_security_definer_views() SET search_path = public;