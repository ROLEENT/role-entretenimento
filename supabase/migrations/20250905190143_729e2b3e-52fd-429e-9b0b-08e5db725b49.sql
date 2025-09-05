-- Corrigir problemas de segurança críticos identificados pelo linter

-- 1. Criar função para validar admin com search_path seguro
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = admin_email AND is_active = true
  );
END;
$$;

-- 2. Criar função para validar role com search_path
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR EXISTS(
    SELECT 1 FROM public.admin_users
    WHERE email = auth.email() AND is_active = true
  );
$$;

-- 3. Criar função para validar editor/admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- 4. Criar função para validar admin por email
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_input text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users
    WHERE email = email_input AND is_active = true
  );
$$;

-- 5. Criar função para obter role atual do usuário
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
    'anonymous'
  );
$$;

-- 6. Criar tabela para logs de segurança
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

-- 7. Criar tabela para configurações de compliance
CREATE TABLE IF NOT EXISTS public.compliance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_by text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 8. Inserir configurações padrão de compliance
INSERT INTO public.compliance_settings (setting_key, setting_value) VALUES 
('lgpd_enabled', 'true'),
('gdpr_enabled', 'true'),
('cookie_consent_required', 'true'),
('data_retention_days', '730'),
('privacy_policy_version', '"1.0"')
ON CONFLICT (setting_key) DO NOTHING;

-- 9. Criar RLS para logs de segurança
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON public.security_logs
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- 10. Criar RLS para compliance settings
ALTER TABLE public.compliance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage compliance settings" ON public.compliance_settings
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

CREATE POLICY "Anyone can read compliance settings" ON public.compliance_settings
FOR SELECT USING (true);

-- 11. Função para registrar eventos de segurança
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
END;
$$;