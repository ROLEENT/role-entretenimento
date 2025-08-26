-- FASE 1 - CONTINUAÇÃO CORREÇÃO DE SEGURANÇA CRÍTICA
-- Corrigir as 9 funções restantes sem search_path

-- Identificar e corrigir todas as funções restantes
ALTER FUNCTION public.set_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.touch_profiles_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.touch_venues_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.touch_organizers_updated_at() SET search_path TO 'public';

-- Funções de gamificação e atividade
ALTER FUNCTION public.notify_new_follower() SET search_path TO 'public';
ALTER FUNCTION public.notify_event_favorite() SET search_path TO 'public';
ALTER FUNCTION public.create_activity(uuid, text, text, uuid, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.update_follow_counts() SET search_path TO 'public';
ALTER FUNCTION public.update_group_members_count() SET search_path TO 'public';

-- Verificar se existem views problemáticas e substituir por funções
-- Remover qualquer view SECURITY DEFINER e criar função equivalente

-- Criar políticas RLS para a tabela sem políticas identificada
-- Verificar qual tabela precisa de políticas RLS
-- Como o linter não especifica, vamos consultar quais tabelas têm RLS habilitado sem políticas

DO $$
DECLARE
    table_name TEXT;
BEGIN
    -- Encontrar tabelas com RLS habilitado mas sem políticas
    FOR table_name IN
        SELECT t.tablename
        FROM pg_tables t
        WHERE t.schemaname = 'public'
        AND EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = t.tablename
            AND n.nspname = 'public'
            AND c.relrowsecurity = true
        )
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies p
            WHERE p.schemaname = 'public'
            AND p.tablename = t.tablename
        )
    LOOP
        -- Adicionar política básica para admin
        EXECUTE format('CREATE POLICY "Admin can manage %I" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', table_name, table_name);
        
        -- Se for uma tabela que pode ter acesso público para leitura
        IF table_name IN ('analytics_summary') THEN
            EXECUTE format('CREATE POLICY "Public can read %I" ON public.%I FOR SELECT USING (true)', table_name, table_name);
        END IF;
    END LOOP;
END $$;

-- Garantir que a função is_admin está correta e segura
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar role do usuário na tabela profiles
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Retornar se é admin
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, negar acesso
  RETURN false;
END;
$$;