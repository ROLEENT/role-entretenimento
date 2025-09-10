-- CORREÇÃO FINAL: Adicionar search_path às funções restantes

-- 1. Função set_updated_by
CREATE OR REPLACE FUNCTION public.set_updated_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Função user_liked_post_hash
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

-- 3. Função get_compliance_setting
CREATE OR REPLACE FUNCTION public.get_compliance_setting(setting_key text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT setting_value FROM public.compliance_settings 
  WHERE compliance_settings.setting_key = get_compliance_setting.setting_key;
$$;

-- 4. Função generate_email_hash
CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT md5(lower(trim(email_text)));
$$;

-- 5. Função debug_admin_highlights
CREATE OR REPLACE FUNCTION public.debug_admin_highlights(p_admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_valid boolean;
  highlights_count integer;
  result jsonb;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  -- Tentar contar highlights
  SELECT COUNT(*) FROM public.highlights INTO highlights_count;
  
  result := jsonb_build_object(
    'admin_email', p_admin_email,
    'admin_valid', admin_valid,
    'highlights_count', highlights_count,
    'header_email', (current_setting('request.headers', true))::json->>'x-admin-email',
    'test_timestamp', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM,
    'admin_email', p_admin_email,
    'error_detail', SQLSTATE
  );
END;
$$;

-- 6. Função get_organizer_admin_data
CREATE OR REPLACE FUNCTION public.get_organizer_admin_data(organizer_id uuid)
RETURNS TABLE(id uuid, name text, contact_email text, site text, instagram text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.contact_email,
    o.site,
    o.instagram,
    o.created_at,
    o.updated_at
  FROM public.organizers o
  WHERE o.id = organizer_id;
END;
$$;

-- 7. Função update_admin_profile
CREATE OR REPLACE FUNCTION public.update_admin_profile(p_admin_id uuid, p_full_name text, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;