-- First, add unique constraint to email if it doesn't exist
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Insert admin user profile
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