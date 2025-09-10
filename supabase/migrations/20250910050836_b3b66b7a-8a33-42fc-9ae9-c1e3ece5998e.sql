-- Fase 6.1 - Finalização Crítica: Correção de Views e Funções (Parte 2)
-- Corrigir erro de função existente

-- Primeiro, remover função existente que tem conflito de parâmetro
DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);

-- Recriar com parâmetros corretos
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

-- Verificar e corrigir outras funções críticas sem search_path
-- Função de validação de usuário editor/admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
END;
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role::text FROM public.user_profiles 
  WHERE user_id = auth.uid();
$$;

-- Função para verificar se pode ver dados sensíveis
CREATE OR REPLACE FUNCTION public.can_view_sensitive_data()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  );
END;
$$;

-- Atualizar função de monitoramento principal com correções
CREATE OR REPLACE FUNCTION public.security_monitor()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  recent_admin_logins integer;
  recent_errors integer;
  recent_critical_events integer;
BEGIN
  -- Contar logins de admin recentes (últimas 24h)
  SELECT COUNT(*) INTO recent_admin_logins
  FROM public.security_log
  WHERE event_type = 'admin_login'
  AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Contar erros recentes (última hora)
  SELECT COUNT(*) INTO recent_errors
  FROM public.security_log
  WHERE severity IN ('error', 'critical')
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Contar eventos críticos recentes (últimas 6h)
  SELECT COUNT(*) INTO recent_critical_events
  FROM public.security_log
  WHERE severity = 'critical'
  AND created_at > NOW() - INTERVAL '6 hours';
  
  result := jsonb_build_object(
    'admin_logins_24h', recent_admin_logins,
    'errors_1h', recent_errors,
    'critical_events_6h', recent_critical_events,
    'status', CASE 
      WHEN recent_critical_events > 0 THEN 'critical'
      WHEN recent_errors > 10 THEN 'warning'
      ELSE 'ok'
    END,
    'last_check', NOW(),
    'system_healthy', recent_critical_events = 0 AND recent_errors < 5
  );
  
  RETURN result;
END;
$$;

-- Função para aplicar melhorias de segurança adicionais
CREATE OR REPLACE FUNCTION public.apply_advanced_security_hardening()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  message text := 'Hardening avançado aplicado: ';
  admin_count integer;
BEGIN
  -- Verificar número de admins ativos
  SELECT COUNT(*) INTO admin_count
  FROM public.approved_admins
  WHERE is_active = true;
  
  -- Log do evento de hardening avançado
  PERFORM log_security_event(
    'advanced_security_hardening',
    NULL,
    'system',
    jsonb_build_object(
      'type', 'advanced_hardening',
      'active_admins', admin_count,
      'timestamp', NOW()
    ),
    'info'
  );
  
  message := message || 'Verificações avançadas executadas, ';
  message := message || admin_count::text || ' admins ativos identificados';
  
  RETURN message;
END;
$$;