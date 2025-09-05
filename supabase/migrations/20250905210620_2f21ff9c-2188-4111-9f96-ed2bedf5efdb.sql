-- Create unified admin validation function
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(p_admin_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = p_admin_email AND is_active = true
  ) AND EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  );
$function$;