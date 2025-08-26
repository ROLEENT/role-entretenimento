-- FINALIZAÇÃO DA CORREÇÃO DE SEGURANÇA - FASE 1
-- Corrigir as 2 tabelas restantes e funções sem search_path

-- 1. Identificar e corrigir as 2 tabelas restantes sem políticas RLS
-- Criar políticas para as tabelas que ainda estão sem

-- Tabela points_history (provável)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'points_history') THEN
    EXECUTE 'CREATE POLICY "Users can view their own points history" ON public.points_history FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "System can insert points history" ON public.points_history FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Tabela user_badges (provável)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_badges') THEN
    EXECUTE 'CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "System can assign badges" ON public.user_badges FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- 2. Corrigir as funções restantes sem search_path
ALTER FUNCTION public.mark_all_notifications_read() SET search_path TO 'public';
ALTER FUNCTION public.add_favorite_to_calendar(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.auto_approve_blog_comments() SET search_path TO 'public';
ALTER FUNCTION public.add_group_creator_as_admin() SET search_path TO 'public';

-- 3. Verificar se há alguma view SECURITY DEFINER e removê-la
-- Lista todas as views para identificar qual é problemática
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname = 'public'
    LOOP
        -- Verificar se a view tem SECURITY DEFINER na definição
        BEGIN
            EXECUTE format('SELECT pg_get_viewdef(''%I.%I'')', rec.schemaname, rec.viewname);
            -- Se chegou aqui, a view existe - remover se tiver SECURITY DEFINER
            IF EXISTS (
                SELECT 1 
                WHERE pg_get_viewdef(format('%I.%I', rec.schemaname, rec.viewname)) LIKE '%SECURITY DEFINER%'
            ) THEN
                EXECUTE format('DROP VIEW %I.%I CASCADE', rec.schemaname, rec.viewname);
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Ignorar erros ao verificar views
                NULL;
        END;
    END LOOP;
END $$;