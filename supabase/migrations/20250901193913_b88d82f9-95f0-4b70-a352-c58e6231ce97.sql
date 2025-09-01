-- Identificar views Security Definer restantes e corrigir as não-admin
-- Remover todas as views Security Definer que não são críticas para admin

-- 1. Drop das views problemáticas restantes (identificadas via linter)
DROP VIEW IF EXISTS public.agentes CASCADE;

-- 2. Adicionar SET search_path = 'public' em mais functions seguras
CREATE OR REPLACE FUNCTION public.validate_username(new_username text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se username tem formato válido (apenas letras, números e underscore)
  IF new_username !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN false;
  END IF;
  
  -- Verificar tamanho (3-30 caracteres)
  IF length(new_username) < 3 OR length(new_username) > 30 THEN
    RETURN false;
  END IF;
  
  -- Verificar se não está em uso
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_users_by_username(search_term text)
RETURNS TABLE(user_id uuid, username text, display_name text, avatar_url text, followers_count integer, is_verified boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.followers_count,
    p.is_verified
  FROM public.profiles p
  WHERE p.username ILIKE '%' || search_term || '%'
    AND p.username IS NOT NULL
  ORDER BY p.followers_count DESC
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.get_post_likes_count(p_post_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.blog_likes
  WHERE post_id = p_post_id;
$$;

CREATE OR REPLACE FUNCTION public.user_liked_post(p_post_id uuid, p_user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.blog_likes
    WHERE post_id = p_post_id AND user_email = p_user_email
  );
$$;

CREATE OR REPLACE FUNCTION public.user_liked_post_hash(p_post_id uuid, p_email_hash text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.blog_likes
    WHERE post_id = p_post_id AND email_hash = p_email_hash
  );
$$;

CREATE OR REPLACE FUNCTION public.user_liked_highlight(p_highlight_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.highlight_likes
    WHERE highlight_id = p_highlight_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_checkin_status(p_event_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.event_checkins
    WHERE event_id = p_event_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_profile_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  orphaned_file RECORD;
BEGIN
  -- Remover avatares órfãos (não referenciados em profiles.avatar_url)
  FOR orphaned_file IN 
    SELECT name, bucket_id 
    FROM storage.objects 
    WHERE bucket_id = 'profile-avatars' 
    AND name NOT IN (
      SELECT REPLACE(avatar_url, 'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/profile-avatars/', '')
      FROM public.profiles 
      WHERE avatar_url IS NOT NULL 
      AND avatar_url LIKE '%profile-avatars%'
    )
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = orphaned_file.bucket_id 
    AND name = orphaned_file.name;
  END LOOP;

  -- Remover covers órfãs (não referenciadas em profiles.cover_url)
  FOR orphaned_file IN 
    SELECT name, bucket_id 
    FROM storage.objects 
    WHERE bucket_id = 'profile-covers' 
    AND name NOT IN (
      SELECT REPLACE(cover_url, 'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/profile-covers/', '')
      FROM public.profiles 
      WHERE cover_url IS NOT NULL 
      AND cover_url LIKE '%profile-covers%'
    )
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = orphaned_file.bucket_id 
    AND name = orphaned_file.name;
  END LOOP;
END;
$$;