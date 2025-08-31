-- Corrigir funções críticas sem search_path
-- 1. Corrigir função validate_username
CREATE OR REPLACE FUNCTION public.validate_username(new_username text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 2. Corrigir função generate_email_hash
CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT md5(lower(trim(email_text)));
$function$;

-- 3. Corrigir função hash_email_for_client
CREATE OR REPLACE FUNCTION public.hash_email_for_client(email_input text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT md5(lower(trim(email_input)));
$function$;

-- 4. Corrigir função is_admin_session_valid
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

-- 5. Corrigir função get_secure_comment_count
CREATE OR REPLACE FUNCTION public.get_secure_comment_count(p_post_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::integer
  FROM public.blog_comments
  WHERE post_id = p_post_id AND is_approved = true;
$function$;