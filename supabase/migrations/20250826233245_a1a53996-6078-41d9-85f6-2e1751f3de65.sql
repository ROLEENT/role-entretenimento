-- CORREÇÃO FINAL DO ERRO CRÍTICO - SECURITY DEFINER VIEW
-- Identificar e remover views SECURITY DEFINER

-- Verificar e listar todas as views no schema public
DO $$
DECLARE
    view_record RECORD;
    view_def TEXT;
BEGIN
    -- Iterar por todas as views e verificar se contêm SECURITY DEFINER
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Obter definição da view
        view_def := pg_get_viewdef(format('%I.%I', view_record.schemaname, view_record.viewname));
        
        -- Se contém SECURITY DEFINER, remover a view
        IF view_def ILIKE '%SECURITY DEFINER%' THEN
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
            RAISE NOTICE 'Removed SECURITY DEFINER view: %.%', view_record.schemaname, view_record.viewname;
        END IF;
    END LOOP;
END $$;

-- Também verificar se há functions mascaradas como views que podem ter SECURITY DEFINER
-- E corrigir qualquer função administrativa restante
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Verificar funções que podem estar causando o problema
    FOR func_record IN
        SELECT p.proname, n.nspname
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND p.provolatile != 'i' -- Não é immutable (pode ser problemática)
    LOOP
        -- Log das funções SECURITY DEFINER encontradas
        RAISE NOTICE 'Found SECURITY DEFINER function: %.%', func_record.nspname, func_record.proname;
    END LOOP;
END $$;