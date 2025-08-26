-- Fase 4: Busca agressiva e eliminação das Security Definer Views restantes

-- Investigação completa em todos os schemas para encontrar Security Definer Views
DO $$
DECLARE
    rec record;
    view_def text;
BEGIN
    RAISE NOTICE 'Iniciando busca completa por Security Definer Views...';
    
    -- Buscar em TODAS as views de TODOS os schemas acessíveis
    FOR rec IN 
        SELECT 
            schemaname,
            viewname,
            definition
        FROM pg_views 
        WHERE definition ~* 'security.definer'
    LOOP
        RAISE NOTICE 'Encontrada Security Definer View: %.% - %', rec.schemaname, rec.viewname, substring(rec.definition from 1 for 100);
        
        -- Tentar remover se estiver no schema public
        IF rec.schemaname = 'public' THEN
            BEGIN
                EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', rec.schemaname, rec.viewname);
                RAISE NOTICE 'Removida view: %.%', rec.schemaname, rec.viewname;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao remover view %.%: %', rec.schemaname, rec.viewname, SQLERRM;
            END;
        END IF;
    END LOOP;
    
    -- Buscar também em materialized views
    FOR rec IN 
        SELECT 
            schemaname,
            matviewname as viewname,
            definition
        FROM pg_matviews 
        WHERE definition ~* 'security.definer'
    LOOP
        RAISE NOTICE 'Encontrada Security Definer Materialized View: %.% - %', rec.schemaname, rec.viewname, substring(rec.definition from 1 for 100);
        
        -- Tentar remover se estiver no schema public
        IF rec.schemaname = 'public' THEN
            BEGIN
                EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', rec.schemaname, rec.viewname);
                RAISE NOTICE 'Removida materialized view: %.%', rec.schemaname, rec.viewname;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao remover materialized view %.%: %', rec.schemaname, rec.viewname, SQLERRM;
            END;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Busca concluída.';
END $$;

-- Tentar mover extensões restantes novamente
DO $$
DECLARE
    ext_record record;
BEGIN
    -- Verificar quais extensões ainda estão no public
    FOR ext_record IN 
        SELECT e.extname, n.nspname as current_schema
        FROM pg_extension e
        JOIN pg_namespace n ON e.extnamespace = n.oid
        WHERE n.nspname = 'public'
        AND e.extname NOT IN ('plpgsql', 'pg_stat_statements')
    LOOP
        BEGIN
            EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_record.extname);
            RAISE NOTICE 'Movida extensão % do schema % para extensions', ext_record.extname, ext_record.current_schema;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Não foi possível mover extensão %: %', ext_record.extname, SQLERRM;
        END;
    END LOOP;
END $$;