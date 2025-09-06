-- Drop existing function first
DROP FUNCTION IF EXISTS public.validate_admin_email(text);

-- Create the function again
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_to_check text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = email_to_check AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;