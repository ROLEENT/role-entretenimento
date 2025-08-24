-- Corrigir funções RPC para funcionar com admin_users system

-- Corrigir função update_admin_profile para funcionar com admin_users
CREATE OR REPLACE FUNCTION public.update_admin_profile(p_admin_id uuid, p_full_name text, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Corrigir função change_admin_password para funcionar com admin_users
CREATE OR REPLACE FUNCTION public.change_admin_password(p_admin_id uuid, p_current_password text, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar senha atual
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = p_admin_id AND password_hash = p_current_password AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;

  -- Atualizar senha
  UPDATE public.admin_users
  SET 
    password_hash = p_new_password,
    updated_at = NOW()
  WHERE id = p_admin_id;
END;
$function$;