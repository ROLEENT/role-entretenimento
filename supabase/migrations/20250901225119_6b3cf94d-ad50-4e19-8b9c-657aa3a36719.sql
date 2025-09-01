-- Final fix for remaining Function Search Path Mutable warnings
-- Target the specific custom functions that still need search_path

-- System/audit functions
ALTER FUNCTION public.audit_trigger_function() SET search_path = 'public';
ALTER FUNCTION public.setup_audit_triggers() SET search_path = 'public';
ALTER FUNCTION public.cleanup_orphaned_profile_files() SET search_path = 'public';

-- Sync functions
ALTER FUNCTION public.sync_artist_to_entity_profile() SET search_path = 'public';
ALTER FUNCTION public.sync_organizer_to_entity_profile() SET search_path = 'public';
ALTER FUNCTION public.sync_venue_to_entity_profile() SET search_path = 'public';

-- Admin and auth functions
ALTER FUNCTION public.create_admin_auth_account(text, text) SET search_path = 'public';
ALTER FUNCTION public.ensure_artist(text, text) SET search_path = 'public';
ALTER FUNCTION public.ensure_preview_token() SET search_path = 'public';
ALTER FUNCTION public.fill_audit_cols() SET search_path = 'public';
ALTER FUNCTION public.auth_role() SET search_path = 'public';
ALTER FUNCTION public.normalize_instagram(text) SET search_path = 'public';

-- Agenda function
ALTER FUNCTION public.agenda_recent_activity_fn(integer) SET search_path = 'public';

-- Migration function  
ALTER FUNCTION public.migrate_agenda_artists(boolean, text) SET search_path = 'public';

-- Set search path for any additional custom functions that may exist
DO $$
DECLARE
    func_record RECORD;
    func_sql TEXT;
BEGIN
    -- Loop through remaining custom functions and fix them
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' 
          AND p.prokind = 'f'
          AND p.proname NOT LIKE 'pg_%'
          AND p.proname NOT LIKE 'unaccent%'
          AND p.proname NOT LIKE 'citext%'
          AND p.proname NOT LIKE 'gin_%'
          AND p.proname NOT LIKE 'gtrgm_%'
          AND p.proname NOT LIKE 'regexp_%'
          AND p.proname NOT LIKE 'similarity%'
          AND p.proname NOT LIKE 'strict_word_%'
          AND p.proname NOT LIKE 'text%'
          AND p.proname NOT LIKE 'show_%'
          AND p.proname NOT LIKE 'set_limit%'
          AND p.proname NOT LIKE 'split_part%'
          AND p.proname NOT LIKE 'strpos%'
          AND p.proname NOT LIKE 'replace%'
          AND p.proconfig IS NULL
    LOOP
        BEGIN
            func_sql := format('ALTER FUNCTION public.%I(%s) SET search_path = ''public''', 
                              func_record.function_name, 
                              func_record.arguments);
            EXECUTE func_sql;
            RAISE NOTICE 'Fixed function: %', func_record.function_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not fix function % with args %: %', 
                        func_record.function_name, 
                        func_record.arguments, 
                        SQLERRM;
        END;
    END LOOP;
END $$;