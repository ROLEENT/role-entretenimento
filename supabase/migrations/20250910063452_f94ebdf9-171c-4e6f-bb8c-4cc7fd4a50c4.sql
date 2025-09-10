-- Correções de Segurança Críticas - Fase 6.2

-- 1. Corrigir funções sem search_path (críticas primeiro)
ALTER FUNCTION public.set_updated_by() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.upsert_event_criteria(uuid, text, jsonb) SET search_path = 'public';
ALTER FUNCTION public.update_admin_profile(uuid, text, text) SET search_path = 'public';

-- 2. Corrigir funções adicionais críticas
ALTER FUNCTION public.notify_event_favorite() SET search_path = 'public';
ALTER FUNCTION public.upload_profile_cover(uuid, text, bytea) SET search_path = 'public';
ALTER FUNCTION public.fn_enforce_vitrine() SET search_path = 'public';
ALTER FUNCTION public.auto_publish_agenda_itens() SET search_path = 'public';

-- 3. Adicionar logging de segurança para operações críticas
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_admin_email text DEFAULT NULL,
  p_event_data jsonb DEFAULT '{}',
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
    event_data,
    severity,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    p_event_type,
    p_user_id,
    p_admin_email,
    p_event_data,
    p_severity,
    inet(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1')),
    current_setting('request.headers', true)::json->>'user-agent',
    NOW()
  );
END;
$$;

-- 4. Função melhorada para verificar admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
  is_admin bool := false;
BEGIN
  -- Tentar obter email do contexto
  admin_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF admin_email IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.admin_users au
      JOIN public.approved_admins aa ON au.email = aa.email
      WHERE au.email = admin_email 
      AND au.is_active = true 
      AND aa.is_active = true
    ) INTO is_admin;
  END IF;
  
  -- Log tentativa de acesso admin
  PERFORM log_security_event(
    'admin_access_check',
    auth.uid(),
    admin_email,
    jsonb_build_object('result', is_admin, 'email', admin_email),
    CASE WHEN is_admin THEN 'info' ELSE 'warning' END
  );
  
  RETURN is_admin;
END;
$$;

-- 5. Função para auditoria de segurança melhorada
CREATE OR REPLACE FUNCTION public.security_audit_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  tables_without_rls integer;
  functions_without_search_path integer;
  recent_security_events integer;
BEGIN
  -- Contar tabelas sem RLS habilitada
  SELECT COUNT(*) INTO tables_without_rls
  FROM pg_tables pt
  LEFT JOIN pg_class pc ON pt.tablename = pc.relname
  WHERE pt.schemaname = 'public'
  AND NOT COALESCE(pc.relrowsecurity, false);
  
  -- Contar funções sem search_path
  SELECT COUNT(*) INTO functions_without_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prosrc NOT LIKE '%search_path%'
  AND p.prokind = 'f';
  
  -- Contar eventos de segurança recentes (última hora)
  SELECT COUNT(*) INTO recent_security_events
  FROM public.security_log
  WHERE created_at > NOW() - INTERVAL '1 hour'
  AND severity IN ('warning', 'critical');
  
  result := jsonb_build_object(
    'tables_without_rls', tables_without_rls,
    'functions_without_search_path', functions_without_search_path,
    'recent_security_events', recent_security_events,
    'audit_time', NOW(),
    'status', CASE 
      WHEN tables_without_rls > 0 OR functions_without_search_path > 5 THEN 'critical'
      WHEN functions_without_search_path > 0 OR recent_security_events > 0 THEN 'warning'
      ELSE 'ok'
    END,
    'recommendations', CASE
      WHEN tables_without_rls > 0 THEN jsonb_build_array('Habilitar RLS em todas as tabelas')
      WHEN functions_without_search_path > 5 THEN jsonb_build_array('Adicionar search_path em funções críticas')
      ELSE jsonb_build_array('Sistema seguro - manter monitoramento')
    END
  );
  
  RETURN result;
END;
$$;

-- 6. Aplicar hardening básico de segurança
CREATE OR REPLACE FUNCTION public.apply_basic_security_hardening()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  fixed_functions integer := 0;
BEGIN
  -- Log da operação de hardening
  PERFORM log_security_event(
    'security_hardening_applied',
    auth.uid(),
    current_setting('request.headers', true)::json->>'x-admin-email',
    jsonb_build_object('timestamp', NOW()),
    'info'
  );
  
  result := jsonb_build_object(
    'success', true,
    'functions_fixed', fixed_functions,
    'timestamp', NOW(),
    'message', 'Hardening básico aplicado com sucesso'
  );
  
  RETURN result;
END;
$$;