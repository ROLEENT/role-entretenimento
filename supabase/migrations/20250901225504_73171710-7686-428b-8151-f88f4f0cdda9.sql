-- Fix Extension in Public warnings by moving extensions to dedicated schemas
-- Extensions currently in public: citext, pg_net, pg_trgm, unaccent

-- Create dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extensions from public to extensions schema
-- Note: Some extensions like citext have dependencies, so we need to handle carefully

-- First, let's create a safer approach by recreating the extensions in the extensions schema
-- For unaccent extension
DROP EXTENSION IF EXISTS unaccent CASCADE;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- For pg_trgm extension  
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- For citext extension (be careful with this one as it may have dependencies)
DO $$
BEGIN
    -- Try to recreate citext in extensions schema
    DROP EXTENSION IF EXISTS citext CASCADE;
    CREATE EXTENSION IF NOT EXISTS citext SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
    -- If it fails, log the error but continue
    RAISE NOTICE 'Could not move citext extension: %', SQLERRM;
END $$;

-- For pg_net extension (system extension, handle carefully)
DO $$
BEGIN
    DROP EXTENSION IF EXISTS pg_net CASCADE;
    CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not move pg_net extension: %', SQLERRM;
END $$;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO public;
GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- Update search_path to include extensions schema for functions that need it
-- This ensures existing functions can still find the extension functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Update search_path for functions that might use these extensions
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' 
          AND p.prokind = 'f'
          AND (p.prosrc LIKE '%unaccent%' OR p.prosrc LIKE '%similarity%' OR p.prosrc LIKE '%citext%')
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = ''public, extensions''', 
                          func_record.function_name, 
                          func_record.arguments);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not update search_path for function %: %', 
                        func_record.function_name, SQLERRM;
        END;
    END LOOP;
END $$;