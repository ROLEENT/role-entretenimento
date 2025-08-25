-- CORREÇÕES CRÍTICAS DE SEGURANÇA SUPABASE - PARTE 1

-- 1. Primeiro, remover a view problemática com SECURITY DEFINER
DROP VIEW IF EXISTS public.blog_comments_safe;

-- Recriar a view sem SECURITY DEFINER (corrige Security Definer View error)
CREATE VIEW public.blog_comments_safe AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  created_at,
  parent_id,
  is_approved
FROM public.blog_comments 
WHERE is_approved = true;

-- 2. Corrigir funções adicionando SET search_path (corrige Function Search Path Mutable warnings)

-- Função validate_admin_email
DROP FUNCTION IF EXISTS public.validate_admin_email(text);
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE approved_admins.email = email_param AND is_active = true
  )
$function$;

-- Função is_admin_user com search_path
DROP FUNCTION IF EXISTS public.is_admin_user();
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_email text;
BEGIN
  -- Tentar obter email do contexto da requisição
  session_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  -- Se não encontrou no header, retorna false
  IF session_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se admin existe e está ativo
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
END;
$function$;

-- Função add_blog_comment_secure com search_path
DROP FUNCTION IF EXISTS public.add_blog_comment_secure(uuid, text, text, text, uuid);
CREATE OR REPLACE FUNCTION public.add_blog_comment_secure(
  p_post_id uuid,
  p_author_name text,
  p_author_email text,
  p_content text,
  p_parent_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  comment_id uuid;
BEGIN
  INSERT INTO public.blog_comments (
    post_id,
    author_name,
    author_email,
    content,
    parent_id,
    is_approved
  ) VALUES (
    p_post_id,
    p_author_name,
    p_author_email,
    p_content,
    p_parent_id,
    true  -- Auto-approve comments
  ) RETURNING id INTO comment_id;
  
  RETURN comment_id;
END;
$function$;

-- Função can_view_comment_email com search_path
CREATE OR REPLACE FUNCTION public.can_view_comment_email(comment_author_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    CASE 
      WHEN auth.jwt() ->> 'email' = comment_author_email THEN true
      WHEN is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) THEN true
      ELSE false
    END
$function$;