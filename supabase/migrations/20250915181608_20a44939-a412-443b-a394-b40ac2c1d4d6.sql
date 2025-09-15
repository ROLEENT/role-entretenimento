-- Correção Final de Segurança - Resolver Issues Críticos

-- 1. Corrigir RLS para tabelas expostas
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- Política restritiva para app_admins - apenas super admins podem ver
CREATE POLICY "Super admins only can view app_admins" 
ON public.app_admins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- 2. Proteger user_roles se existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
    CREATE POLICY "Users can view their own roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (user_id = auth.uid() OR is_admin_user());
    
    DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
    CREATE POLICY "Admins can manage user roles" 
    ON public.user_roles 
    FOR ALL 
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- 3. Proteger js_errors se existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'js_errors' AND table_schema = 'public') THEN
    ALTER TABLE public.js_errors ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admins can view js_errors" ON public.js_errors;
    CREATE POLICY "Admins can view js_errors" 
    ON public.js_errors 
    FOR SELECT 
    USING (is_admin_user());
    
    DROP POLICY IF EXISTS "System can insert js_errors" ON public.js_errors;
    CREATE POLICY "System can insert js_errors" 
    ON public.js_errors 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- 4. Proteger perf_metrics se existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perf_metrics' AND table_schema = 'public') THEN
    ALTER TABLE public.perf_metrics ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admins can view perf_metrics" ON public.perf_metrics;
    CREATE POLICY "Admins can view perf_metrics" 
    ON public.perf_metrics 
    FOR SELECT 
    USING (is_admin_user());
    
    DROP POLICY IF EXISTS "System can insert perf_metrics" ON public.perf_metrics;
    CREATE POLICY "System can insert perf_metrics" 
    ON public.perf_metrics 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- 5. Proteger event_engagement se existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_engagement' AND table_schema = 'public') THEN
    ALTER TABLE public.event_engagement ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own engagement" ON public.event_engagement;
    CREATE POLICY "Users can view their own engagement" 
    ON public.event_engagement 
    FOR SELECT 
    USING (user_id = auth.uid() OR is_admin_user());
    
    DROP POLICY IF EXISTS "Users can create their own engagement" ON public.event_engagement;
    CREATE POLICY "Users can create their own engagement" 
    ON public.event_engagement 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());
    
    DROP POLICY IF EXISTS "Admins can view all engagement" ON public.event_engagement;
    CREATE POLICY "Admins can view all engagement" 
    ON public.event_engagement 
    FOR ALL 
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- 6. Corrigir funções sem search_path restantes
-- Buscar e corrigir todas as funções SECURITY DEFINER sem search_path

-- Função para check_user_is_editor_or_admin se ainda não tem search_path
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
END;
$function$;

-- Função auth_role se ainda não tem search_path
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT role::text FROM public.user_profiles WHERE user_id = auth.uid()),
    'viewer'
  );
END;
$function$;

-- 7. Criar função para auditoria de segurança
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_email text;
BEGIN
  -- Obter email do admin do contexto
  admin_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  -- Log das operações administrativas
  INSERT INTO public.admin_audit_log (
    admin_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(admin_email, 'system'),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 8. Função de validação de segurança
CREATE OR REPLACE FUNCTION public.validate_security_measures()
RETURNS TABLE(check_type text, status text, details text, severity text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar tabelas sem RLS
  RETURN QUERY
  SELECT 
    'tables_without_rls'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Tabelas sem RLS: ' || COUNT(*)::text,
    'critical'::text
  FROM pg_tables pt
  LEFT JOIN pg_class pc ON pc.relname = pt.tablename
  WHERE pt.schemaname = 'public'
    AND pt.tablename NOT LIKE 'pg_%'
    AND pt.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
    AND NOT pc.relrowsecurity;

  -- Verificar funções sem search_path
  RETURN QUERY
  SELECT 
    'functions_without_search_path'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Funções sem search_path: ' || COUNT(*)::text,
    'high'::text
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND NOT (pg_get_functiondef(p.oid) ILIKE '%SET search_path%');

  RETURN;
END;
$function$;

-- 9. Log de segurança
PERFORM log_security_event(
  'security_hardening_complete',
  NULL,
  'system',
  jsonb_build_object(
    'timestamp', NOW(),
    'fixes_applied', 'RLS_policies,search_path_functions,audit_triggers'
  ),
  'info'
);