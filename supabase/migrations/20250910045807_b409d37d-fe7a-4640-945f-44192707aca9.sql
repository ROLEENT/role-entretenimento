-- Correção Final de Segurança - Parte 2
-- Corrigir funções restantes sem search_path e views problemáticas

-- Atualizar funções restantes que ainda não têm search_path
CREATE OR REPLACE FUNCTION public.fn_slugify(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN 'untitled-event';
  END IF;
  
  -- Usar unaccent da extensão se disponível, senão fazer limpeza básica
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          COALESCE(extensions.unaccent(trim(input_text)), trim(input_text)), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Fallback sem unaccent se houver erro
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

-- Atualizar função to_slug
CREATE OR REPLACE FUNCTION public.to_slug(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN trim(input_text) = '' OR input_text IS NULL THEN 'unnamed-genre'
    ELSE regexp_replace(
      lower(trim(input_text)), 
      '[^a-z0-9]+', '-', 'g'
    )
  END;
$$;

-- Atualizar função generate_email_hash
CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT md5(lower(trim(email_text)));
$$;

-- Atualizar função get_compliance_setting
CREATE OR REPLACE FUNCTION public.get_compliance_setting(setting_key text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT setting_value FROM public.compliance_settings 
  WHERE compliance_settings.setting_key = get_compliance_setting.setting_key;
$$;

-- Atualizar função user_liked_post_hash
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

-- Atualizar função get_user_checkin_status
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

-- Atualizar função user_liked_highlight
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

-- Atualizar função is_admin_session
CREATE OR REPLACE FUNCTION public.is_admin_session(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
$$;