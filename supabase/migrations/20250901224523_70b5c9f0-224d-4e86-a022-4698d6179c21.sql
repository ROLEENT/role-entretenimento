-- Fix Function Search Path Mutable warnings 
-- Start with common functions to reduce warnings incrementally

-- Basic utility functions
ALTER FUNCTION public.fn_profile_set_owner() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.validate_profile_image_urls() SET search_path = 'public';
ALTER FUNCTION public.update_profiles_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_highlight_reviews_updated_at() SET search_path = 'public';

-- Let's check which functions exist and need fixing first
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Get list of functions that need fixing
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
          AND p.proconfig IS NULL
        ORDER BY p.proname
        LIMIT 5
    LOOP
        RAISE NOTICE 'Function: % with args: %', func_record.function_name, func_record.arguments;
    END LOOP;
END $$;