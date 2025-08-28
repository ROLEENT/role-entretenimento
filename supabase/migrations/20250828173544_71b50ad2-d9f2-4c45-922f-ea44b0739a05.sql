-- Listar todas as funções relacionadas a highlight para identificar duplicatas
SELECT routine_name, routine_type, specific_name, data_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%highlight%' 
AND routine_schema = 'public'
ORDER BY routine_name;

-- Remover todas as versões da função explicitamente
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2(text, text, text, text, text, text, text, text[], text, text, text, text, integer, boolean);
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2(text, uuid, text, text, text, text, text, text, text[], text, text, text, text, integer, boolean);

-- Limpar qualquer outra versão que possa existir
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname IN ('admin_create_highlight_v2', 'admin_update_highlight_v2')
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s)', func_record.proname, func_record.args);
    END LOOP;
END $$;