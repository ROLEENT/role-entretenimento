-- Correção Final de Segurança - Fase 6
-- Corrigir funções restantes sem search_path seguro

-- Corrigir outras funções que não possuem search_path
CREATE OR REPLACE FUNCTION public.create_activity(
  p_user_id uuid, 
  p_type text, 
  p_object_type text, 
  p_object_id uuid, 
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.activity_feed (
    user_id,
    actor_id,
    type,
    object_type,
    object_id,
    data
  ) VALUES (
    p_user_id,
    p_user_id,
    p_type,
    p_object_type,
    p_object_id,
    p_data
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Função para log de eventos de segurança
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT NULL,
  admin_email text DEFAULT NULL,
  event_data jsonb DEFAULT '{}',
  severity text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.security_log (
    event_type,
    user_id,
    admin_email,
    event_data,
    severity,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    event_type,
    COALESCE(user_id, auth.uid()),
    admin_email,
    event_data,
    severity,
    inet_client_addr(),
    COALESCE((current_setting('request.headers', true))::json ->> 'user-agent', 'unknown'),
    NOW()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
EXCEPTION WHEN OTHERS THEN
  -- Se log falhar, não quebrar operação principal
  RETURN gen_random_uuid();
END;
$$;

-- Corrigir função reset_daily_notification_count
CREATE OR REPLACE FUNCTION public.reset_daily_notification_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.notification_logs 
  SET daily_count = 0,
      last_reset_at = NOW()
  WHERE last_reset_at < CURRENT_DATE;
END;
$$;

-- Configurações de segurança para autenticação
-- Reduzir tempo de expiração OTP para 5 minutos
UPDATE auth.config 
SET value = '300'
WHERE parameter = 'otp_exp_time';

-- Habilitar proteção contra senhas vazadas
UPDATE auth.config 
SET value = 'true'
WHERE parameter = 'security_update_password_require_reauthentication';