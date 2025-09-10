-- ETAPA 1: Correção Imediata de Segurança - Parte 1

-- 1. Remover função existente e recriar com search_path adequado
DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);

CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = session_email AND is_active = true
  )
$$;

-- 2. Remover views problemáticas com SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_users_view CASCADE;
DROP VIEW IF EXISTS public.admin_events_view CASCADE;
DROP VIEW IF EXISTS public.admin_artists_view CASCADE;
DROP VIEW IF EXISTS public.security_definer_views CASCADE;

-- 3. Criar função para validar email de admin de forma segura
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = email_to_check AND is_active = true
  )
$$;

-- 4. Corrigir função auth_role para usar search_path adequado
DROP FUNCTION IF EXISTS public.auth_role();
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
    'viewer'
  )::text
$$;

-- 5. Garantir que admin de referência está ativo
INSERT INTO public.approved_admins (email, approved_by, is_active) 
VALUES ('fiih@roleentretenimento.com', 'system', true)
ON CONFLICT (email) DO UPDATE SET is_active = true, approved_by = 'system';