-- Corrigir problemas de segurança - Criar estruturas sem modificar funções existentes

-- 1. Criar tabela para logs de segurança
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  admin_email text,
  ip_address inet,
  user_agent text,
  details jsonb DEFAULT '{}',
  severity text DEFAULT 'info',
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Criar tabela para configurações de compliance
CREATE TABLE IF NOT EXISTS public.compliance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_by text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Inserir configurações padrão de compliance
INSERT INTO public.compliance_settings (setting_key, setting_value) VALUES 
('lgpd_enabled', 'true'),
('gdpr_enabled', 'true'),
('cookie_consent_required', 'true'),
('data_retention_days', '730'),
('privacy_policy_version', '"1.0"'),
('csp_enabled', 'true'),
('security_headers_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- 4. Criar RLS para logs de segurança
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON public.security_logs
FOR ALL USING (
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- 5. Criar RLS para compliance settings
ALTER TABLE public.compliance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage compliance settings" ON public.compliance_settings
FOR ALL USING (
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Anyone can read compliance settings" ON public.compliance_settings
FOR SELECT USING (true);

-- 6. Função para registrar eventos de segurança
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
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_logs (
    event_type, user_id, admin_email, details, severity,
    ip_address, user_agent
  ) VALUES (
    p_event_type, p_user_id, p_admin_email, p_details, p_severity,
    inet_client_addr(), 
    current_setting('request.headers', true)::json ->> 'user-agent'
  );
EXCEPTION WHEN OTHERS THEN
  -- Log errors silently to avoid breaking application flow
  NULL;
END;
$$;

-- 7. Função para obter configurações de compliance
CREATE OR REPLACE FUNCTION public.get_compliance_setting(setting_key text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT setting_value FROM public.compliance_settings 
  WHERE compliance_settings.setting_key = get_compliance_setting.setting_key;
$$;