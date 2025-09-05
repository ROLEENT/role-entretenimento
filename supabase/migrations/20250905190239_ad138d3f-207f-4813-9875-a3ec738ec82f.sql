-- Corrigir problemas de segurança - Fase 1: Drop e recriar funções

-- 1. Drop função existente para recriar com parâmetros corretos
DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);

-- 2. Recriar função para validar admin com search_path seguro
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

-- 3. Criar tabela para logs de segurança
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

-- 4. Criar tabela para configurações de compliance
CREATE TABLE IF NOT EXISTS public.compliance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_by text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Inserir configurações padrão de compliance
INSERT INTO public.compliance_settings (setting_key, setting_value) VALUES 
('lgpd_enabled', 'true'),
('gdpr_enabled', 'true'),
('cookie_consent_required', 'true'),
('data_retention_days', '730'),
('privacy_policy_version', '"1.0"')
ON CONFLICT (setting_key) DO NOTHING;

-- 6. Criar RLS para logs de segurança
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON public.security_logs
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- 7. Criar RLS para compliance settings
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