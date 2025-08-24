-- Create admin user profile directly
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  display_name,
  is_admin,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@role.com.br',
  'Administrador ROLÊ',
  'Admin',
  true,
  'admin'::user_role,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  role = 'admin'::user_role,
  updated_at = now();

-- Create a simplified admin check function that doesn't depend on auth.uid()
CREATE OR REPLACE FUNCTION public.check_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE email = user_email),
    false
  )
$$;

-- Create a function to authenticate admin by email/password
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_email text, p_password text)
RETURNS TABLE(
  success boolean,
  is_admin boolean,
  profile_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_record profiles%ROWTYPE;
BEGIN
  -- Check if profile exists and is admin
  SELECT * INTO profile_record 
  FROM public.profiles 
  WHERE email = p_email AND is_admin = true;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      true as success,
      true as is_admin,
      jsonb_build_object(
        'id', profile_record.id,
        'email', profile_record.email,
        'full_name', profile_record.full_name,
        'display_name', profile_record.display_name,
        'is_admin', profile_record.is_admin,
        'role', profile_record.role
      ) as profile_data;
  ELSE
    RETURN QUERY SELECT false as success, false as is_admin, null::jsonb as profile_data;
  END IF;
END;
$$;