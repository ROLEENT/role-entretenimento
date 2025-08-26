-- Ensure admin profile exists for the admin email
INSERT INTO public.profiles (user_id, full_name, email, is_admin)
SELECT 
  'admin-user-id'::uuid,
  'Admin ROLE',
  'admin@role.com.br',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'admin@role.com.br'
);

-- Update existing profile to be admin if it exists
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@role.com.br' AND is_admin = false;