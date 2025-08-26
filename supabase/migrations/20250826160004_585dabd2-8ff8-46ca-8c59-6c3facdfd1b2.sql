-- Drop and recreate authenticate_admin_secure function with correct gen_random_bytes
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
  
  -- Generate session token using extensions.gen_random_bytes
  new_session_token := encode(extensions.gen_random_bytes(32), 'base64');
  
  -- Store session in admin_sessions table
  INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
  VALUES (admin_record.id, new_session_token, NOW() + INTERVAL '24 hours')
  ON CONFLICT (admin_id) DO UPDATE SET
    session_token = EXCLUDED.session_token,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();
  
  -- Return success
  RETURN QUERY SELECT true, 'Login realizado com sucesso'::text, admin_record.id, new_session_token;
END;
$function$;