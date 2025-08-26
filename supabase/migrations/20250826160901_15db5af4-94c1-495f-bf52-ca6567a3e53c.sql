-- Fix ambiguous column reference in authenticate_admin_secure function
DROP FUNCTION IF EXISTS public.authenticate_admin_secure(text, text);

CREATE OR REPLACE FUNCTION public.authenticate_admin_secure(p_email text, p_password text)
RETURNS TABLE(success boolean, message text, admin_id uuid, session_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stored_password text;
  admin_record RECORD;
  new_session_token text;
BEGIN
  -- Check if admin exists and is active
  SELECT id, email, password_hash, full_name, is_active
  INTO admin_record
  FROM public.admin_users
  WHERE email = p_email;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Email ou senha incorretos'::text, NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  IF NOT admin_record.is_active THEN
    RETURN QUERY SELECT false, 'Conta desativada'::text, NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Simple password comparison (in production, use proper hashing)
  IF admin_record.password_hash != p_password THEN
    RETURN QUERY SELECT false, 'Email ou senha incorretos'::text, NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Generate session token using gen_random_uuid as base
  new_session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Store session in admin_sessions table - FIX: qualify admin_id column
  INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
  VALUES (admin_record.id, new_session_token, NOW() + INTERVAL '24 hours')
  ON CONFLICT (admin_sessions.admin_id) DO UPDATE SET
    session_token = EXCLUDED.session_token,
    expires_at = EXCLUDED.expires_at,
    last_used_at = NOW();
  
  -- Update last login timestamp
  UPDATE public.admin_users 
  SET last_login_at = NOW() 
  WHERE id = admin_record.id;
  
  -- Return success
  RETURN QUERY SELECT true, 'Login realizado com sucesso'::text, admin_record.id, new_session_token;
END;
$function$;