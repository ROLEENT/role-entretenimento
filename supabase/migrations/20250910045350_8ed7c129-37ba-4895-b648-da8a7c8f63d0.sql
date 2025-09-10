-- Correção Crítica de Segurança - Fase 6
-- Prioridade 1: Hardening de Functions (corrigir search_path mutable)

-- Função para validar sessão de admin
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users au
    JOIN public.approved_admins aa ON au.email = aa.email
    WHERE au.email = session_email 
    AND au.is_active = true 
    AND aa.is_active = true
  );
$$;

-- Função para verificar se usuário é editor ou admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('admin', 'editor')
  );
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
END;
$$;

-- Criar tabela de log de segurança se não existir
CREATE TABLE IF NOT EXISTS public.security_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  admin_email text,
  event_data jsonb DEFAULT '{}',
  severity text DEFAULT 'info',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de log de segurança
ALTER TABLE public.security_log ENABLE ROW LEVEL SECURITY;

-- Política para log de segurança - apenas admins podem ver
CREATE POLICY "Admins can view security logs" ON public.security_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.approved_admins aa ON au.email = aa.email
    WHERE au.email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND au.is_active = true 
    AND aa.is_active = true
  )
);

-- Sistema pode inserir logs
CREATE POLICY "System can insert security logs" ON public.security_log
FOR INSERT
WITH CHECK (true);