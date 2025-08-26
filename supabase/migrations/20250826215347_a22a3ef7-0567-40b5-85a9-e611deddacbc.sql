-- CORREÇÃO COMPLETA DA AUTENTICAÇÃO ADMIN

-- 1. Verificar e atualizar usuários admin na tabela profiles
-- Garantir que os emails corretos tenham is_admin = true
UPDATE public.profiles 
SET is_admin = true 
WHERE email IN ('admin@role.com.br', 'fiih@roleentretenimento.com')
AND is_admin = false;

-- Inserir admins se não existirem (caso não tenham perfil ainda)
INSERT INTO public.profiles (user_id, email, is_admin, display_name)
SELECT 
  au.id,
  au.email,
  true,
  COALESCE(au.raw_user_meta_data->>'display_name', 'Admin')
FROM auth.users au
WHERE au.email IN ('admin@role.com.br', 'fiih@roleentretenimento.com')
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
)
ON CONFLICT (user_id) DO UPDATE SET
  is_admin = true,
  email = EXCLUDED.email;

-- 2. Criar função is_admin unificada e consistente
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

-- 3. Corrigir função ensure_admin_role para usar estrutura correta
CREATE OR REPLACE FUNCTION public.ensure_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar is_admin = true se usuário está na lista de emails aprovados
  UPDATE public.profiles 
  SET is_admin = true
  WHERE email = user_email 
    AND is_admin = false
    AND email IN ('admin@role.com.br', 'fiih@roleentretenimento.com');
END;
$$;

-- 4. Criar função para verificar se sessão admin é válida
CREATE OR REPLACE FUNCTION public.is_admin_session_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE public.is_admin(auth.uid())
  END;
$$;

-- 5. Atualizar RLS policies para highlights usando a função is_admin consistente
DROP POLICY IF EXISTS "Admins can manage highlights" ON public.highlights;
CREATE POLICY "Admins can manage highlights" ON public.highlights
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Verificar dados finais
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM public.profiles 
  WHERE is_admin = true;
  
  RAISE NOTICE 'Total de usuários admin configurados: %', admin_count;
END $$;