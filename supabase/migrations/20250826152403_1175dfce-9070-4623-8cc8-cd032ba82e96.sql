-- Drop and recreate admin functions to fix gen_random_bytes reference

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.authenticate_admin_secure(text, text);
DROP FUNCTION IF EXISTS public.update_admin_password_secure(uuid, text);
DROP FUNCTION IF EXISTS public.generate_confirmation_token();

-- Recreate update_admin_password_secure function
CREATE OR REPLACE FUNCTION public.update_admin_password_secure(p_admin_id uuid, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  salt text;
BEGIN
  -- Generate a random salt using proper extensions schema reference
  salt := encode(extensions.gen_random_bytes(32), 'base64');
  
  -- For now, we'll store a simple hash. In production, use proper bcrypt
  UPDATE public.admin_users
  SET 
    password_hash = encode(digest(p_new_password || salt, 'sha256'), 'hex'),
    password_salt = salt,
    login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE id = p_admin_id AND is_active = true;
  
  RETURN FOUND;
END;
$function$;

-- Recreate authenticate_admin_secure function
CREATE OR REPLACE FUNCTION public.authenticate_admin_secure(p_email text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  session_token text;
  computed_hash text;
BEGIN
  -- Get admin record
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE email = p_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;

  -- Check if account is locked
  IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Account temporarily locked'
    );
  END IF;

  -- For accounts with salt, verify hashed password
  IF admin_record.password_salt IS NOT NULL THEN
    computed_hash := encode(digest(p_password || admin_record.password_salt, 'sha256'), 'hex');
    
    IF computed_hash != admin_record.password_hash THEN
      -- Increment login attempts
      UPDATE public.admin_users
      SET 
        login_attempts = login_attempts + 1,
        locked_until = CASE 
          WHEN login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
          ELSE NULL
        END
      WHERE id = admin_record.id;
      
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid credentials'
      );
    END IF;
  ELSE
    -- For accounts without salt (plain text passwords), direct comparison
    IF p_password != admin_record.password_hash THEN
      -- Increment login attempts
      UPDATE public.admin_users
      SET 
        login_attempts = login_attempts + 1,
        locked_until = CASE 
          WHEN login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
          ELSE NULL
        END
      WHERE id = admin_record.id;
      
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid credentials'
      );
    END IF;
  END IF;

  -- Generate secure session token using proper extensions schema reference
  session_token := encode(extensions.gen_random_bytes(32), 'base64url');
  
  -- Create session
  INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
  VALUES (
    admin_record.id,
    session_token,
    NOW() + INTERVAL '24 hours'
  );
  
  -- Update last login and reset attempts
  UPDATE public.admin_users
  SET 
    last_login_at = NOW(),
    login_attempts = 0,
    locked_until = NULL
  WHERE id = admin_record.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'session_token', session_token,
    'admin', jsonb_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name
    ),
    'requires_password_update', (admin_record.password_salt IS NULL)
  );
END;
$function$;

-- Recreate generate_confirmation_token function
CREATE OR REPLACE FUNCTION public.generate_confirmation_token()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(extensions.gen_random_bytes(32), 'base64url');
END;
$function$;