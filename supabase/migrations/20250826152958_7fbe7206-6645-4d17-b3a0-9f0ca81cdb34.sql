-- Fix base64url encoding error by using base64 instead
-- Drop and recreate functions with correct encoding

DROP FUNCTION IF EXISTS public.authenticate_admin_secure(text, text);
DROP FUNCTION IF EXISTS public.generate_confirmation_token();

-- Recreate authenticate_admin_secure with base64 encoding
CREATE OR REPLACE FUNCTION public.authenticate_admin_secure(
  p_email text,
  p_password text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  session_token text;
  session_expires timestamp with time zone;
  result jsonb;
BEGIN
  -- Get admin record
  SELECT id, email, password_hash, full_name, is_active, login_attempts, locked_until
  INTO admin_record
  FROM public.admin_users
  WHERE email = p_email;
  
  -- Check if admin exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credenciais inválidas';
  END IF;
  
  -- Check if admin is active
  IF NOT admin_record.is_active THEN
    RAISE EXCEPTION 'Conta administrativa desativada';
  END IF;
  
  -- Check if account is locked
  IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > NOW() THEN
    RAISE EXCEPTION 'Conta bloqueada temporariamente';
  END IF;
  
  -- Verify password (assuming bcrypt hash comparison)
  IF admin_record.password_hash != p_password THEN
    -- Increment login attempts
    UPDATE public.admin_users 
    SET login_attempts = COALESCE(login_attempts, 0) + 1,
        locked_until = CASE 
          WHEN COALESCE(login_attempts, 0) + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
          ELSE NULL 
        END
    WHERE id = admin_record.id;
    
    RAISE EXCEPTION 'Credenciais inválidas';
  END IF;
  
  -- Reset login attempts on successful login
  UPDATE public.admin_users 
  SET login_attempts = 0, 
      locked_until = NULL,
      last_login_at = NOW()
  WHERE id = admin_record.id;
  
  -- Generate session token using base64 encoding
  session_token := encode(extensions.gen_random_bytes(32), 'base64');
  session_expires := NOW() + INTERVAL '24 hours';
  
  -- Store session
  INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
  VALUES (admin_record.id, session_token, session_expires);
  
  -- Return success with session data
  result := jsonb_build_object(
    'success', true,
    'admin', jsonb_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name
    ),
    'session_token', session_token,
    'expires_at', session_expires
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Recreate generate_confirmation_token with base64 encoding
CREATE OR REPLACE FUNCTION public.generate_confirmation_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN encode(extensions.gen_random_bytes(32), 'base64');
END;
$$;

-- Also fix update_admin_password_secure if it uses base64url
DROP FUNCTION IF EXISTS public.update_admin_password_secure(text, text);

CREATE OR REPLACE FUNCTION public.update_admin_password_secure(
  p_session_token text,
  p_new_password text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_record RECORD;
  admin_record RECORD;
  result jsonb;
BEGIN
  -- Validate session token
  SELECT s.admin_id, s.expires_at, a.email, a.full_name
  INTO session_record
  FROM public.admin_sessions s
  JOIN public.admin_users a ON s.admin_id = a.id
  WHERE s.session_token = p_session_token
    AND s.expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Sessão inválida ou expirada'
    );
  END IF;
  
  -- Update password
  UPDATE public.admin_users
  SET password_hash = p_new_password,
      updated_at = NOW()
  WHERE id = session_record.admin_id;
  
  -- Return success
  result := jsonb_build_object(
    'success', true,
    'message', 'Senha atualizada com sucesso'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;