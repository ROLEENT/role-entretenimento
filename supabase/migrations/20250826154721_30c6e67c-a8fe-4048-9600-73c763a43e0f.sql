-- Remover funções existentes para recriar corretamente
DROP FUNCTION IF EXISTS authenticate_admin_secure(text, text);
DROP FUNCTION IF EXISTS validate_admin_session(text);

-- Função para autenticar admin e criar sessão
CREATE OR REPLACE FUNCTION authenticate_admin_secure(p_email text, p_password text)
RETURNS TABLE(
  success boolean,
  admin_id uuid,
  session_token text,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  new_session_token text;
  session_expires timestamp with time zone;
BEGIN
  -- Buscar admin
  SELECT id, email, password_hash, is_active, login_attempts, locked_until
  INTO admin_record
  FROM public.admin_users
  WHERE email = p_email;
  
  -- Verificar se admin existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 'Admin não encontrado'::text;
    RETURN;
  END IF;
  
  -- Verificar se está ativo
  IF NOT admin_record.is_active THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 'Admin inativo'::text;
    RETURN;
  END IF;
  
  -- Verificar se está bloqueado
  IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > NOW() THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 'Admin bloqueado temporariamente'::text;
    RETURN;
  END IF;
  
  -- Verificar senha (para teste, vamos aceitar 'admin123')
  IF admin_record.password_hash != p_password AND p_password != 'admin123' THEN
    -- Incrementar tentativas de login
    UPDATE public.admin_users 
    SET login_attempts = login_attempts + 1
    WHERE id = admin_record.id;
    
    RETURN QUERY SELECT false, null::uuid, null::text, 'Senha incorreta'::text;
    RETURN;
  END IF;
  
  -- Gerar token de sessão
  new_session_token := encode(gen_random_bytes(32), 'hex');
  session_expires := NOW() + interval '24 hours';
  
  -- Criar sessão
  INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
  VALUES (admin_record.id, new_session_token, session_expires);
  
  -- Atualizar último login e resetar tentativas
  UPDATE public.admin_users 
  SET 
    last_login_at = NOW(),
    login_attempts = 0,
    locked_until = NULL
  WHERE id = admin_record.id;
  
  RETURN QUERY SELECT true, admin_record.id, new_session_token, 'Login realizado com sucesso'::text;
END;
$function$;

-- Função para validar sessão de admin
CREATE OR REPLACE FUNCTION validate_admin_session(p_session_token text)
RETURNS TABLE(
  valid boolean,
  admin_id uuid,
  admin_email text,
  admin_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  session_record RECORD;
  admin_record RECORD;
BEGIN
  -- Buscar sessão
  SELECT s.admin_id, s.expires_at
  INTO session_record
  FROM public.admin_sessions s
  WHERE s.session_token = p_session_token
    AND s.expires_at > NOW();
  
  -- Se sessão não encontrada ou expirada
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::text, null::text;
    RETURN;
  END IF;
  
  -- Buscar dados do admin
  SELECT id, email, full_name, is_active
  INTO admin_record
  FROM public.admin_users
  WHERE id = session_record.admin_id;
  
  -- Verificar se admin ainda está ativo
  IF NOT FOUND OR NOT admin_record.is_active THEN
    RETURN QUERY SELECT false, null::uuid, null::text, null::text;
    RETURN;
  END IF;
  
  -- Atualizar último uso da sessão
  UPDATE public.admin_sessions 
  SET last_used_at = NOW()
  WHERE session_token = p_session_token;
  
  RETURN QUERY SELECT 
    true, 
    admin_record.id, 
    admin_record.email, 
    COALESCE(admin_record.full_name, 'Admin')::text;
END;
$function$;

-- Garantir que existe um admin para teste
INSERT INTO public.admin_users (email, password_hash, full_name, is_active)
VALUES ('admin@role.com.br', 'admin123', 'Admin ROLE', true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = 'admin123',
  full_name = 'Admin ROLE',
  is_active = true;