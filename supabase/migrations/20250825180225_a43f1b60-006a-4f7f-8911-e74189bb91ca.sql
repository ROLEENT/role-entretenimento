-- Configurar políticas de segurança para OTP e senhas
-- Criar função para validar expiração de tokens
CREATE OR REPLACE FUNCTION auth.is_token_expired(token_created_at timestamptz, expiry_minutes int DEFAULT 10)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT token_created_at + (expiry_minutes || ' minutes')::interval < now();
$$;

-- Melhorar função de validação de admin
CREATE OR REPLACE FUNCTION is_admin_session_valid(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se não tem email, não é válido
  IF admin_email IS NULL OR admin_email = '' THEN
    RETURN false;
  END IF;
  
  -- Verificar se existe admin ativo com esse email
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = admin_email 
    AND is_active = true
  );
END;
$$;

-- Atualizar função de autenticação de admin para ser mais segura
CREATE OR REPLACE FUNCTION authenticate_admin_simple(p_email text, p_password text)
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  result json;
BEGIN
  -- Verificar se existe admin ativo
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = p_email 
  AND is_active = true;
  
  -- Se não encontrou admin ou senha incorreta
  IF NOT FOUND OR admin_record.password_hash != crypt(p_password, admin_record.password_hash) THEN
    RETURN ARRAY[json_build_object('success', false)];
  END IF;
  
  -- Retornar dados do admin
  result := json_build_object(
    'success', true,
    'admin_data', json_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name,
      'is_admin', true
    )
  );
  
  RETURN ARRAY[result];
END;
$$;