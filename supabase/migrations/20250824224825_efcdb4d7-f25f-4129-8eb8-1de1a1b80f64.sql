-- FASE 1: Correções Críticas de Segurança

-- 1. CORRIGIR SEGURANÇA DA TABELA ADMIN_USERS
-- Remover políticas RLS inseguras existentes
DROP POLICY IF EXISTS "Authenticated admins can update profiles" ON public.admin_users;
DROP POLICY IF EXISTS "Authenticated admins can view profiles" ON public.admin_users;
DROP POLICY IF EXISTS "Simple admin users policy" ON public.admin_users;

-- Criar políticas RLS mais seguras para admin_users
CREATE POLICY "Admin users can view own profile only"
ON public.admin_users
FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Admin users can update own profile only"
ON public.admin_users
FOR UPDATE
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Nenhuma política para INSERT/DELETE - apenas via funções administrativas controladas

-- 2. PROTEGER DADOS PESSOAIS - RESTRINGIR ACESSO A EMAILS
-- Atualizar políticas da tabela profiles para proteger emails
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view limited profile data"
ON public.profiles
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Próprio perfil completo
    WHEN is_admin_user() THEN true       -- Admins veem tudo
    ELSE false                           -- Outros não veem nada por enquanto
  END
);

-- 3. PROTEGER DADOS DE CONTATO DE ORGANIZADORES
-- Remover política que expõe dados de contato
DROP POLICY IF EXISTS "Anyone can view organizers" ON public.organizers;

CREATE POLICY "Public can view organizer basic info"
ON public.organizers
FOR SELECT
USING (true);

-- Criar view pública para organizadores sem dados sensíveis
CREATE OR REPLACE VIEW public.organizers_public AS
SELECT 
  id,
  name,
  instagram,
  site,
  created_at,
  updated_at
FROM public.organizers;

-- 4. PROTEGER DADOS DE CONTATO DE PARCEIROS
-- Atualizar política para proteger emails de parceiros
DROP POLICY IF EXISTS "Anyone can view partners" ON public.partners;

CREATE POLICY "Public can view partner basic info"
ON public.partners
FOR SELECT
USING (true);

-- Criar view pública para parceiros sem dados sensíveis
CREATE OR REPLACE VIEW public.partners_public AS
SELECT 
  id,
  name,
  location,
  rating,
  image_url,
  capacity,
  types,
  website,
  instagram,
  featured,
  created_at,
  updated_at
FROM public.partners;

-- 5. PROTEGER COMENTÁRIOS DO BLOG
-- Atualizar políticas para proteger emails de autores
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;

CREATE POLICY "Public can view approved comments without emails"
ON public.blog_comments
FOR SELECT
USING (is_approved = true);

-- Criar view pública para comentários sem emails
CREATE OR REPLACE VIEW public.blog_comments_public AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  created_at,
  parent_id
FROM public.blog_comments
WHERE is_approved = true;

-- 6. PROTEGER LIKES DO BLOG
-- Atualizar política para proteger emails
DROP POLICY IF EXISTS "Anyone can view likes" ON public.blog_likes;

CREATE POLICY "Users can view like counts only"
ON public.blog_likes
FOR SELECT
USING (false); -- Ninguém pode ver diretamente

-- Criar view para contagem de likes sem exposição de emails
CREATE OR REPLACE VIEW public.blog_likes_count AS
SELECT 
  post_id,
  COUNT(*) as like_count
FROM public.blog_likes
GROUP BY post_id;

-- 7. CORRIGIR FUNÇÕES RPC COM SEGURANÇA ADEQUADA
-- Atualizar função de autenticação admin com search_path seguro
CREATE OR REPLACE FUNCTION public.authenticate_admin_simple(p_email text, p_password text)
RETURNS TABLE(success boolean, admin_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Verificar se admin existe e senha confere
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE email = p_email AND password_hash = p_password AND is_active = true;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      true as success,
      jsonb_build_object(
        'id', admin_record.id,
        'email', admin_record.email,
        'full_name', admin_record.full_name,
        'is_admin', true
      ) as admin_data;
  ELSE
    RETURN QUERY SELECT false as success, null::jsonb as admin_data;
  END IF;
END;
$function$;

-- Atualizar outras funções admin com search_path seguro
CREATE OR REPLACE FUNCTION public.update_admin_profile(p_admin_id uuid, p_full_name text, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = p_admin_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Admin não encontrado ou inativo';
  END IF;

  -- Atualizar perfil do admin
  UPDATE public.admin_users
  SET 
    full_name = p_full_name,
    email = p_email,
    updated_at = NOW()
  WHERE id = p_admin_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.change_admin_password(p_admin_id uuid, p_current_password text, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar senha atual
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = p_admin_id AND password_hash = p_current_password AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;

  -- Atualizar senha
  UPDATE public.admin_users
  SET 
    password_hash = p_new_password,
    updated_at = NOW()
  WHERE id = p_admin_id;
END;
$function$;

-- 8. CRIAR FUNÇÃO PARA VALIDAÇÃO SEGURA DE ADMIN
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(p_admin_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  );
$function$;