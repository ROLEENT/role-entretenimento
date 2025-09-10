-- PHASE 6: Final function hardening - identify and fix ALL remaining functions

-- Get complete list and fix each one individually
-- Fix find_security_definer_views
CREATE OR REPLACE FUNCTION public.find_security_definer_views()
RETURNS TABLE(view_name text, view_definition text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    table_name::text,
    view_definition::text
  FROM information_schema.views 
  WHERE table_schema = 'public'
  AND view_definition ILIKE '%SECURITY DEFINER%'
$$;

-- Fix can_view_sensitive_data
CREATE OR REPLACE FUNCTION public.can_view_sensitive_data()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(is_admin_user(), false);
$$;

-- Fix app_is_admin  
CREATE OR REPLACE FUNCTION public.app_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT exists (
    SELECT 1
    FROM public.app_admins a
    WHERE lower(a.email) = lower(coalesce(nullif(current_setting('request.jwt.claim.email', true), ''), ''))
  );
$$;

-- Fix is_admin_simple
CREATE OR REPLACE FUNCTION public.is_admin_simple()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = auth.email() AND is_active = true
  );
$$;

-- Fix to_slug
CREATE OR REPLACE FUNCTION public.to_slug(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN trim(input_text) = '' OR input_text IS NULL THEN 'unnamed-genre'
    ELSE regexp_replace(
      lower(trim(input_text)), 
      '[^a-z0-9]+', '-', 'g'
    )
  END;
$$;

-- Fix fn_slugify
CREATE OR REPLACE FUNCTION public.fn_slugify(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN 'untitled-event';
  END IF;
  
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
EXCEPTION WHEN OTHERS THEN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

-- Final validation count
SELECT COUNT(*) as remaining_functions_without_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND NOT (pg_get_functiondef(p.oid) ILIKE '%SET search_path%');