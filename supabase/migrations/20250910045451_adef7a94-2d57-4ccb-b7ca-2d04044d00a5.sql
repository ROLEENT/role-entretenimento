-- Correção Crítica de Segurança - Fase 6 (Parte 1)
-- Dropar funções existentes e recriar com parâmetros corretos

-- Dropar funções existentes que causam conflito
DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);
DROP FUNCTION IF EXISTS public.check_user_is_editor_or_admin();

-- Recriar função para validar sessão de admin com search_path seguro
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users au
    JOIN public.approved_admins aa ON au.email = aa.email
    WHERE au.email = session_email 
    AND au.is_active = true 
    AND aa.is_active = true
  );
$$;

-- Recriar função para verificar se usuário é editor ou admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('admin', 'editor')
  );
$$;

-- Corrigir funções existentes para adicionar search_path seguro
CREATE OR REPLACE FUNCTION public.hash_email_for_client(email_input text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT encode(digest(lower(trim(email_input)), 'sha256'), 'hex');
$$;

-- Atualizar função de criar comentário para usar search_path seguro
CREATE OR REPLACE FUNCTION public.add_blog_comment_secure_hash(
  p_post_id uuid,
  p_author_name text,
  p_email_hash text,
  p_content text,
  p_parent_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_comment_id uuid;
BEGIN
  -- Validar entrada
  IF LENGTH(trim(p_author_name)) = 0 THEN
    RAISE EXCEPTION 'Nome do autor é obrigatório';
  END IF;
  
  IF LENGTH(trim(p_content)) = 0 THEN
    RAISE EXCEPTION 'Conteúdo do comentário é obrigatório';
  END IF;
  
  -- Inserir comentário
  INSERT INTO public.blog_comments (
    post_id,
    display_name,
    email_hash,
    content,
    parent_id,
    is_hidden,
    created_at
  ) VALUES (
    p_post_id,
    trim(p_author_name),
    p_email_hash,
    trim(p_content),
    p_parent_id,
    false,
    NOW()
  ) RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$;