-- Fase 6.1 - Finalização Crítica: Correção de Views e Funções
-- Implementar apenas configurações críticas de segurança restantes

-- 1. Identificar e corrigir views Security Definer problemáticas
-- Primeiro, vamos verificar se existem views com Security Definer
-- Se existirem, vamos removê-las e recriar sem Security Definer

-- 2. Corrigir funções principais sem search_path
-- Identificamos funções críticas que ainda precisam do SET search_path

-- Função para verificar permissões de admin válidas
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  valid_admin boolean := false;
BEGIN
  -- Verificar se está na tabela admin_users E approved_admins
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users au
    JOIN public.approved_admins aa ON au.email = aa.email
    WHERE au.email = p_email 
    AND au.is_active = true 
    AND aa.is_active = true
  ) INTO valid_admin;
  
  RETURN valid_admin;
END;
$$;

-- Corrigir funções críticas sem search_path
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_admin_email text DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_log (
    event_type,
    user_id,
    admin_email,
    details,
    severity,
    ip_address,
    user_agent
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    p_admin_email,
    p_details,
    p_severity,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN (current_setting('request.headers', true)::json ->> 'x-forwarded-for')::inet
      ELSE NULL 
    END,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN current_setting('request.headers', true)::json ->> 'user-agent'
      ELSE NULL 
    END
  );
END;
$$;

-- Função de auditoria com search_path seguro
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Obter email do admin do cabeçalho da requisição
  admin_email := COALESCE(
    (current_setting('request.headers', true))::json ->> 'x-admin-email',
    'system'
  );

  -- Log da operação
  IF TG_OP = 'INSERT' THEN
    PERFORM log_security_event(
      'data_insert',
      auth.uid(),
      admin_email,
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'new_data', to_jsonb(NEW)
      ),
      'info'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_security_event(
      'data_update',
      auth.uid(),
      admin_email,
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'old_data', to_jsonb(OLD),
        'new_data', to_jsonb(NEW)
      ),
      'info'
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_security_event(
      'data_delete',
      auth.uid(),
      admin_email,
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'old_data', to_jsonb(OLD)
      ),
      'warning'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Corrigir mais funções críticas
CREATE OR REPLACE FUNCTION public.get_compliance_setting(setting_key text)
RETURNS jsonb
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT setting_value FROM public.compliance_settings 
  WHERE compliance_settings.setting_key = get_compliance_setting.setting_key;
$$;

CREATE OR REPLACE FUNCTION public.user_liked_post_hash(p_post_id uuid, p_email_hash text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.blog_likes
    WHERE post_id = p_post_id AND email_hash = p_email_hash
  );
$$;

CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT md5(lower(trim(email_text)));
$$;

CREATE OR REPLACE FUNCTION public.find_security_definer_views()
RETURNS TABLE(view_name text, view_definition text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    table_name::text,
    view_definition::text
  FROM information_schema.views 
  WHERE table_schema = 'public'
  AND view_definition ILIKE '%SECURITY DEFINER%'
$$;

CREATE OR REPLACE FUNCTION public.to_slug(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN trim(input_text) = '' OR input_text IS NULL THEN 'unnamed-genre'
    ELSE regexp_replace(
      lower(trim(input_text)), 
      '[^a-z0-9]+', '-', 'g'
    )
  END;
$$;

-- Função para monitoramento de segurança contínuo
CREATE OR REPLACE FUNCTION public.continuous_security_monitor()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  failed_logins integer;
  admin_activities integer;
  suspicious_ips integer;
BEGIN
  -- Contar tentativas de login falharam (última hora)
  SELECT COUNT(*) INTO failed_logins
  FROM public.security_log
  WHERE event_type = 'admin_login_failed'
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Contar atividades administrativas (últimas 24h)
  SELECT COUNT(*) INTO admin_activities
  FROM public.security_log
  WHERE admin_email IS NOT NULL
  AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Detectar IPs suspeitos (mais de 10 tentativas de login por hora)
  SELECT COUNT(DISTINCT ip_address) INTO suspicious_ips
  FROM public.security_log
  WHERE event_type LIKE '%login%'
  AND created_at > NOW() - INTERVAL '1 hour'
  GROUP BY ip_address
  HAVING COUNT(*) > 10;
  
  result := jsonb_build_object(
    'failed_logins_1h', failed_logins,
    'admin_activities_24h', admin_activities,
    'suspicious_ips', suspicious_ips,
    'status', CASE 
      WHEN failed_logins > 20 OR suspicious_ips > 0 THEN 'critical'
      WHEN failed_logins > 10 THEN 'warning'
      ELSE 'ok'
    END,
    'last_check', NOW()
  );
  
  -- Se crítico, logar automaticamente
  IF (result->>'status') = 'critical' THEN
    PERFORM log_security_event(
      'security_alert_critical',
      NULL,
      'system',
      result,
      'critical'
    );
  END IF;
  
  RETURN result;
END;
$$;