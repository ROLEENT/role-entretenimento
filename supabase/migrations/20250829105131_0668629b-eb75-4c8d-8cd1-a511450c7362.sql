-- Atualizar role do fiih para admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'fiih@roleentretenimento.com';

-- Inserir profile para guilherme se não existir
INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
SELECT 
  u.id,
  'guilherme@roleentretenimento.com',
  'admin',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'guilherme@roleentretenimento.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.email = 'guilherme@roleentretenimento.com'
  );