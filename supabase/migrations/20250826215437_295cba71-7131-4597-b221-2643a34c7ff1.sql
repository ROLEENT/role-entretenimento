-- CORREÇÃO COMPLETA DA AUTENTICAÇÃO ADMIN - VERSÃO 2

-- 1. Remover funções conflitantes existentes
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. Criar função is_admin unificada
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

-- 3. Garantir que usuários admin estão configurados corretamente
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

-- 5. Função para verificar autenticação admin
CREATE OR REPLACE FUNCTION public.is_admin_authenticated()
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

-- 6. Atualizar RLS policies para highlights
DROP POLICY IF EXISTS "Admins can manage highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins can create highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins can update highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins can delete highlights" ON public.highlights;

CREATE POLICY "Admins can manage highlights" ON public.highlights
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());