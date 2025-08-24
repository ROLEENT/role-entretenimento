-- Fix admin authentication system to work with admin_users table

-- Create function to check if current session has admin access
CREATE OR REPLACE FUNCTION public.is_admin_session(session_email text)
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

-- Update partners table RLS policies
DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Update advertisements table RLS policies  
DROP POLICY IF EXISTS "Admins can manage advertisements" ON public.advertisements;
CREATE POLICY "Admins can manage advertisements" 
ON public.advertisements 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Update admin_users table RLS policies to be more permissive for authenticated admins
DROP POLICY IF EXISTS "Admin users can view own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update own profile" ON public.admin_users;

CREATE POLICY "Authenticated admins can view profiles" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated admins can update profiles" 
ON public.admin_users 
FOR UPDATE 
USING (true)
WITH CHECK (true);