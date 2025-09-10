-- PHASE 6: FINAL SECURITY HARDENING - STEP 1: Critical Security Definer Views

-- First, find all Security Definer Views
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE definition ILIKE '%SECURITY DEFINER%'
  AND schemaname = 'public';

-- Find all functions without proper search_path
SELECT 
  p.proname as function_name,
  n.nspname as schema_name,
  pg_get_function_result(p.oid) as return_type,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true  -- SECURITY DEFINER functions
  AND NOT (
    pg_get_functiondef(p.oid) ILIKE '%SET search_path%'
  );

-- Step 1: Fix remaining Security Definer Views by converting to SECURITY INVOKER
-- Most views should use SECURITY INVOKER unless they specifically need elevated privileges

-- Drop and recreate any problematic views as SECURITY INVOKER
-- (We'll identify specific views from the query above)

-- Step 2: Harden remaining functions without search_path
-- Fix check_user_is_editor_or_admin function
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
END;
$$;

-- Fix get_user_role function if it exists
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT role::text FROM public.user_profiles 
  WHERE user_id = auth.uid();
$$;

-- Fix any other functions that might be missing search_path
-- This will be identified by the queries above

-- Step 3: Create comprehensive security validation function
CREATE OR REPLACE FUNCTION public.validate_all_security_measures()
RETURNS TABLE(
  check_type text,
  status text,
  details text,
  severity text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check for Security Definer Views
  RETURN QUERY
  SELECT 
    'security_definer_views'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || COUNT(*) || ' Security Definer Views'::text,
    'critical'::text
  FROM pg_views 
  WHERE definition ILIKE '%SECURITY DEFINER%'
    AND schemaname = 'public';

  -- Check for functions without search_path
  RETURN QUERY
  SELECT 
    'functions_without_search_path'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || COUNT(*) || ' functions without search_path'::text,
    'high'::text
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND NOT (pg_get_functiondef(p.oid) ILIKE '%SET search_path%');

  -- Check RLS status
  RETURN QUERY
  SELECT 
    'rls_enabled'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || COUNT(*) || ' tables without RLS'::text,
    'critical'::text
  FROM pg_tables pt
  LEFT JOIN pg_class pc ON pc.relname = pt.tablename
  WHERE pt.schemaname = 'public'
    AND NOT pc.relrowsecurity;

  RETURN;
END;
$$;