-- Fix critical security issues

-- Fix Security Definer Views (converting to regular views or updating with proper settings)
-- These will be recreated without SECURITY DEFINER if they are simple views

-- Update all functions without search_path to include it
-- Adding search_path to functions that don't have it for security

CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()),
    false
  )
$function$;

CREATE OR REPLACE FUNCTION public.validate_admin_email(email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE approved_admins.email = validate_admin_email.email AND is_active = true
  )
$function$;