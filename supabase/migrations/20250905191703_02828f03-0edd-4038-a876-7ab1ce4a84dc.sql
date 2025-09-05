-- Corrigir problemas de segurança - Adicionar search_path a funções existentes sem recriar

-- Corrigir is_admin_session_valid adicionando search_path
ALTER FUNCTION public.is_admin_session_valid(text) SET search_path = public;

-- Corrigir validate_admin_email adicionando search_path  
ALTER FUNCTION public.validate_admin_email(text) SET search_path = public;

-- Corrigir outras funções que precisam de search_path
-- Verificar e corrigir funções que podem não ter search_path

-- Adicionar search_path a funções que não têm
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_email text;
  old_json jsonb;
  new_json jsonb;
BEGIN
  -- Get admin email from headers
  admin_email := (current_setting('request.headers', true))::json ->> 'x-admin-email';
  
  -- Convert OLD and NEW to jsonb, handling null values
  old_json := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  new_json := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
  
  -- Insert audit record
  INSERT INTO public.admin_audit_log (
    admin_email,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    admin_email,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN (OLD.id)::uuid
      ELSE (NEW.id)::uuid
    END,
    TG_OP,
    old_json,
    new_json,
    inet_client_addr(),
    (current_setting('request.headers', true))::json ->> 'user-agent'
  );
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Função para resetar contadores diários
CREATE OR REPLACE FUNCTION public.reset_daily_notification_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset daily notification counters
  UPDATE public.user_profiles 
  SET daily_notification_count = 0;
  
  -- Log the reset
  INSERT INTO public.security_logs (event_type, details, severity)
  VALUES ('daily_reset', '{"action": "notification_counters_reset"}', 'info');
END;
$$;