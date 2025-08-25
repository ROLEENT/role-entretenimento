-- CORREÇÕES FINAIS DE SEGURANÇA CRÍTICA

-- 1. Corrigir as funções restantes que precisam de search_path
-- Atualizar função authenticate_admin_simple
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

-- Atualizar função admin_get_highlights  
CREATE OR REPLACE FUNCTION public.admin_get_highlights(p_admin_email text, p_city text DEFAULT NULL::text, p_search text DEFAULT NULL::text)
RETURNS TABLE(id uuid, city city, event_title text, venue text, ticket_url text, role_text character varying, selection_reasons text[], image_url text, photo_credit text, event_date date, event_time time without time zone, ticket_price text, sort_order integer, is_published boolean, like_count integer, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  RETURN QUERY
  SELECT 
    h.id, h.city, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE 
    (p_city IS NULL OR h.city::text = p_city)
    AND (p_search IS NULL OR h.event_title ILIKE '%' || p_search || '%')
  ORDER BY h.created_at DESC;
END;
$function$;

-- Atualizar função admin_get_highlight_by_id
CREATE OR REPLACE FUNCTION public.admin_get_highlight_by_id(p_admin_email text, p_highlight_id uuid)
RETURNS TABLE(id uuid, city city, event_title text, venue text, ticket_url text, role_text character varying, selection_reasons text[], image_url text, photo_credit text, event_date date, event_time time without time zone, ticket_price text, sort_order integer, is_published boolean, like_count integer, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  RETURN QUERY
  SELECT 
    h.id, h.city, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$function$;

-- Atualizar função create_admin_session
CREATE OR REPLACE FUNCTION public.create_admin_session(p_admin_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_token text;
BEGIN
  -- Generate secure session token
  session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Clean up old sessions for this admin (keep only last 5)
  DELETE FROM public.admin_sessions 
  WHERE admin_id = p_admin_id 
  AND id NOT IN (
    SELECT id FROM public.admin_sessions 
    WHERE admin_id = p_admin_id 
    ORDER BY created_at DESC 
    LIMIT 5
  );
  
  -- Insert new session
  INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
  VALUES (p_admin_id, session_token, NOW() + INTERVAL '24 hours');
  
  RETURN session_token;
END;
$function$;

-- Atualizar função validate_admin_session
CREATE OR REPLACE FUNCTION public.validate_admin_session(p_session_token text)
RETURNS TABLE(admin_id uuid, admin_email text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.admin_id,
    a.email,
    (s.expires_at > NOW()) as is_valid
  FROM public.admin_sessions s
  JOIN public.admin_users a ON s.admin_id = a.id
  WHERE s.session_token = p_session_token
  AND a.is_active = true;
  
  -- Update last_used_at if session is valid
  UPDATE public.admin_sessions 
  SET last_used_at = NOW()
  WHERE session_token = p_session_token 
  AND expires_at > NOW();
END;
$function$;

-- Atualizar função admin_delete_highlight
CREATE OR REPLACE FUNCTION public.admin_delete_highlight(p_admin_email text, p_highlight_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se o highlight existe
  IF NOT EXISTS (
    SELECT 1 FROM public.highlights WHERE id = p_highlight_id
  ) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Deletar o highlight
  DELETE FROM public.highlights WHERE id = p_highlight_id;

  RETURN true;
END;
$function$;

-- Atualizar função authenticate_admin_secure
CREATE OR REPLACE FUNCTION public.authenticate_admin_secure(p_email text, p_password text)
RETURNS TABLE(success boolean, admin_data jsonb, requires_password_update boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record admin_users%ROWTYPE;
  is_legacy_password boolean := false;
BEGIN
  -- Check for rate limiting
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE email = p_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false as success, null::jsonb as admin_data, false as requires_password_update;
    RETURN;
  END IF;
  
  -- Check if account is locked
  IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > NOW() THEN
    RETURN QUERY SELECT false as success, null::jsonb as admin_data, false as requires_password_update;
    RETURN;
  END IF;
  
  -- Check if it's a legacy password (plain text)
  IF admin_record.password_salt IS NULL THEN
    is_legacy_password := true;
    -- For legacy passwords, check direct match (temporary)
    IF admin_record.password_hash = p_password THEN
      -- Update last login
      UPDATE public.admin_users SET 
        last_login_at = NOW(),
        login_attempts = 0,
        locked_until = NULL
      WHERE id = admin_record.id;
      
      RETURN QUERY SELECT 
        true as success,
        jsonb_build_object(
          'id', admin_record.id,
          'email', admin_record.email,
          'full_name', admin_record.full_name,
          'is_admin', true
        ) as admin_data,
        true as requires_password_update; -- Force password update for legacy accounts
    ELSE
      -- Failed login attempt
      UPDATE public.admin_users SET 
        login_attempts = login_attempts + 1,
        locked_until = CASE 
          WHEN login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'
          ELSE NULL 
        END
      WHERE id = admin_record.id;
      
      RETURN QUERY SELECT false as success, null::jsonb as admin_data, false as requires_password_update;
    END IF;
  ELSE
    -- For hashed passwords, verify using crypt (will implement proper hashing)
    -- For now, return false to force password reset for all hashed passwords
    RETURN QUERY SELECT false as success, null::jsonb as admin_data, true as requires_password_update;
  END IF;
END;
$function$;

-- 2. Mover extensões para fora do schema public
DO $$
BEGIN
  -- Criar schema extensions se não existir
  CREATE SCHEMA IF NOT EXISTS extensions;
  
  -- Mover uuid-ossp se estiver no public
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'uuid-ossp' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
  
  -- Mover pgcrypto se estiver no public
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pgcrypto' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;
  END IF;
END
$$;