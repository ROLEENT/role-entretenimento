-- Fase 3 Final: Identificação e correção completa das Security Definer Views

-- Remover completamente qualquer view restante que possa estar causando problemas
-- e verificar se há materializadas views ou outros objetos problemáticos

-- Lista completa de verificação e limpeza
DO $$
DECLARE
    rec record;
BEGIN
    -- Verificar e remover views com SECURITY DEFINER
    FOR rec IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
        AND (definition ILIKE '%security definer%' OR definition ILIKE '%security_definer%')
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', rec.schemaname, rec.viewname);
        RAISE NOTICE 'Dropped security definer view: %.%', rec.schemaname, rec.viewname;
    END LOOP;
    
    -- Verificar materialized views também
    FOR rec IN 
        SELECT schemaname, matviewname as viewname
        FROM pg_matviews 
        WHERE schemaname = 'public'
        AND (definition ILIKE '%security definer%' OR definition ILIKE '%security_definer%')
    LOOP
        EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', rec.schemaname, rec.viewname);
        RAISE NOTICE 'Dropped security definer materialized view: %.%', rec.schemaname, rec.viewname;
    END LOOP;
END $$;

-- Mover extensões do schema public para extensions
-- Isso resolve o warning "Extension in Public"
DO $$
DECLARE
    ext_name text;
BEGIN
    -- Criar schema extensions se não existir
    CREATE SCHEMA IF NOT EXISTS extensions;
    
    -- Listar extensões no schema public e movê-las
    FOR ext_name IN 
        SELECT extname 
        FROM pg_extension e
        JOIN pg_namespace n ON e.extnamespace = n.oid
        WHERE n.nspname = 'public'
        AND extname NOT IN ('plpgsql') -- Não mover extensões críticas
    LOOP
        BEGIN
            EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_name);
            RAISE NOTICE 'Moved extension % to extensions schema', ext_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not move extension %: %', ext_name, SQLERRM;
        END;
    END LOOP;
END $$;