-- Fase 4: Corrigir functions públicas restantes (não-admin) sem search_path
-- Focando apenas em functions seguras que não são relacionadas ao admin

CREATE OR REPLACE FUNCTION public.add_blog_comment_secure(p_post_id uuid, p_author_name text, p_content text, p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  comment_id uuid;
  email_hash_val text;
BEGIN
  -- Gerar hash do email
  email_hash_val := md5(lower(trim(p_email)));
  
  INSERT INTO public.blog_comments (
    post_id, 
    author_name, 
    content, 
    email_hash,
    user_id,
    is_approved
  ) VALUES (
    p_post_id, 
    p_author_name, 
    p_content, 
    email_hash_val,
    auth.uid(),
    true
  ) RETURNING id INTO comment_id;
  
  RETURN comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_blog_comment_secure_hash(p_post_id uuid, p_author_name text, p_content text, p_email_hash text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  comment_id uuid;
BEGIN
  INSERT INTO public.blog_comments (
    post_id, 
    author_name, 
    content, 
    email_hash,
    user_id,
    is_approved
  ) VALUES (
    p_post_id, 
    p_author_name, 
    p_content, 
    p_email_hash,
    auth.uid(),
    true
  ) RETURNING id INTO comment_id;
  
  RETURN comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_blog_comment(p_comment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.blog_comments
  SET is_approved = true
  WHERE id = p_comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_approve_blog_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Auto-approve all new blog comments
  NEW.is_approved = true;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_delete_highlight()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;