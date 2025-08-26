-- Criar perfil admin faltante para o usuário existente
INSERT INTO public.profiles (
  user_id, 
  email, 
  is_admin, 
  full_name,
  role
) 
SELECT 
  au.id,
  au.email,
  true,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Admin'),
  'admin'::user_role
FROM auth.users au
WHERE au.email = 'fiih@roleentretenimento.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = au.id
);