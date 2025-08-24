-- Create a simple admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Insert admin user with a simple password hash (admin123)
INSERT INTO public.admin_users (email, password_hash, full_name)
VALUES ('admin@role.com.br', 'admin123', 'Administrador ROLÊ')
ON CONFLICT (email) DO UPDATE SET
  password_hash = 'admin123',
  full_name = 'Administrador ROLÊ',
  is_active = true,
  updated_at = now();

-- Create function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin_simple(p_email text, p_password text)
RETURNS TABLE(
  success boolean,
  admin_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Check if admin exists and password matches
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE email = p_email AND password_hash = p_password AND is_active = true;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      true as success,
      jsonb_build_object(
        'id', admin_record.id,
        'email', admin_record.email,
        'full_name', admin_record.full_name,
        'is_admin', true
      ) as admin_data;
  ELSE
    RETURN QUERY SELECT false as success, null::jsonb as admin_data;
  END IF;
END;
$$;

-- Create function to check if current session is admin
CREATE OR REPLACE FUNCTION public.is_current_admin(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  )
$$;