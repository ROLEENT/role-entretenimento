-- CORREÇÃO COMPLETA DA AUTENTICAÇÃO ADMIN - VERSÃO 3
-- Mantendo função is_admin existente mas corrigindo implementação

-- 1. Atualizar função is_admin existente para usar implementação correta
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = uid),
    false
  )
$$;

-- 2. Garantir que usuários admin estão configurados corretamente
-- Verificar se profile existe para cada usuário auth
INSERT INTO public.profiles (user_id, email, is_admin, display_name)
SELECT 
  au.id,
  au.email,
  CASE WHEN au.email IN ('admin@role.com.br', 'fiih@roleentretenimento.com') THEN true ELSE false END,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email)
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Atualizar usuários admin existentes
UPDATE public.profiles 
SET is_admin = true 
WHERE email IN ('admin@role.com.br', 'fiih@roleentretenimento.com')
AND is_admin = false;

-- 4. Corrigir função ensure_admin_role
CREATE OR REPLACE FUNCTION public.ensure_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET is_admin = true
  WHERE email = user_email 
    AND is_admin = false
    AND email IN ('admin@role.com.br', 'fiih@roleentretenimento.com');
END;
$$;

-- 5. Verificar configuração final
SELECT email, is_admin FROM public.profiles WHERE email IN ('admin@role.com.br', 'fiih@roleentretenimento.com');