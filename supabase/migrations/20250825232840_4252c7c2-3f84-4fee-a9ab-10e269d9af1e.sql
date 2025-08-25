-- Drop and recreate functions with proper search_path

DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);
DROP FUNCTION IF EXISTS public.is_admin_user();
DROP FUNCTION IF EXISTS public.validate_admin_email(text);

-- Recreate with proper search_path
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