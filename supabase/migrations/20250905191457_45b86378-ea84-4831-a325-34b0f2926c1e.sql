-- Corrigir problemas críticos de segurança - Fase 1: Funções básicas

-- Primeiro, vamos remover e recriar as funções que têm conflito de parâmetros
DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);
DROP FUNCTION IF EXISTS public.validate_admin_email(text);

-- Recriar função is_admin_session_valid com search_path seguro
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  )
$$;

-- Recriar função validate_admin_email com search_path seguro
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_to_validate text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = email_to_validate AND is_active = true
  )
$$;

-- Corrigir outras funções adicionando SET search_path = public
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()),
    'viewer'
  )
$$;