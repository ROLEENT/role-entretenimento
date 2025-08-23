-- Update existing users to have admin role if they're in approved_admins
UPDATE public.profiles 
SET role = 'admin'::user_role 
WHERE email IN (
  SELECT email FROM public.approved_admins WHERE is_active = true
);

-- Update the handle_new_user function to automatically assign admin role to approved emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
DECLARE
  user_role user_role := 'editor';
BEGIN
  -- Check if email is in approved_admins and assign admin role
  IF EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = NEW.email AND is_active = true
  ) THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    NEW.email,
    user_role
  );
  RETURN NEW;
END;
$$;

-- Create a function to ensure approved users have admin role on login
CREATE OR REPLACE FUNCTION public.ensure_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update role to admin if user is in approved_admins but doesn't have admin role
  UPDATE public.profiles 
  SET role = 'admin'::user_role
  WHERE email = user_email 
    AND role != 'admin'::user_role
    AND EXISTS (
      SELECT 1 FROM public.approved_admins 
      WHERE email = user_email AND is_active = true
    );
END;
$$;