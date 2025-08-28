-- ETAPA 5: Sincronização e Correção dos Dados
-- 1. Sincronizar campo is_admin com role na tabela profiles
UPDATE public.profiles 
SET is_admin = CASE 
  WHEN role = 'admin' THEN true 
  ELSE false 
END;

-- 2. Corrigir inconsistências do fidorneles (promover para admin já que está em admin_users e approved_admins)
UPDATE public.profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'fidorneles@roleentretenimento.com';

-- 3. Criar função para validar consistência de dados
CREATE OR REPLACE FUNCTION public.validate_role_consistency()
RETURNS TABLE(
  user_email text,
  profile_role user_role,
  profile_is_admin boolean,
  in_approved_admins boolean,
  in_admin_users boolean,
  is_consistent boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.email,
    p.role,
    p.is_admin,
    (aa.email IS NOT NULL) as in_approved_admins,
    (au.email IS NOT NULL) as in_admin_users,
    CASE 
      WHEN p.role = 'admin' AND p.is_admin = true AND aa.email IS NOT NULL AND au.email IS NOT NULL THEN true
      WHEN p.role = 'editor' AND p.is_admin = false AND aa.email IS NULL AND au.email IS NULL THEN true
      ELSE false
    END as is_consistent
  FROM public.profiles p
  LEFT JOIN public.approved_admins aa ON p.email = aa.email AND aa.is_active = true
  LEFT JOIN public.admin_users au ON p.email = au.email AND au.is_active = true
  ORDER BY p.email;
END;
$$;

-- 4. Criar função para auditoria de mudanças de role
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log mudanças de role
  IF OLD.role != NEW.role OR OLD.is_admin != NEW.is_admin THEN
    INSERT INTO public.admin_audit_log (
      admin_email, 
      action, 
      table_name, 
      record_id, 
      old_values, 
      new_values
    ) VALUES (
      COALESCE(
        (current_setting('request.headers', true))::json ->> 'x-admin-email',
        'system'
      ),
      'role_change',
      'profiles',
      NEW.user_id,
      jsonb_build_object(
        'role', OLD.role,
        'is_admin', OLD.is_admin
      ),
      jsonb_build_object(
        'role', NEW.role,
        'is_admin', NEW.is_admin
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Criar trigger para auditoria automática
DROP TRIGGER IF EXISTS audit_profile_role_changes ON public.profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 6. Função para sincronizar is_admin automaticamente
CREATE OR REPLACE FUNCTION public.sync_is_admin_with_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Sincronizar is_admin com role automaticamente
  NEW.is_admin = (NEW.role = 'admin');
  RETURN NEW;
END;
$$;

-- 7. Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS sync_is_admin_trigger ON public.profiles;
CREATE TRIGGER sync_is_admin_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_is_admin_with_role();

-- 8. Criar função para debug e diagnóstico do sistema de auth
CREATE OR REPLACE FUNCTION public.debug_auth_system(p_user_email text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  consistency_data record;
BEGIN
  -- Se email específico fornecido
  IF p_user_email IS NOT NULL THEN
    SELECT * INTO consistency_data 
    FROM public.validate_role_consistency() 
    WHERE user_email = p_user_email;
    
    result := jsonb_build_object(
      'user_email', p_user_email,
      'consistency_check', to_jsonb(consistency_data),
      'timestamp', NOW()
    );
  ELSE
    -- Relatório geral do sistema
    result := jsonb_build_object(
      'total_profiles', (SELECT COUNT(*) FROM public.profiles),
      'total_admins', (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin'),
      'total_editors', (SELECT COUNT(*) FROM public.profiles WHERE role = 'editor'),
      'approved_admins', (SELECT COUNT(*) FROM public.approved_admins WHERE is_active = true),
      'admin_users', (SELECT COUNT(*) FROM public.admin_users WHERE is_active = true),
      'inconsistent_users', (
        SELECT COUNT(*) FROM public.validate_role_consistency() 
        WHERE NOT is_consistent
      ),
      'timestamp', NOW()
    );
  END IF;
  
  RETURN result;
END;
$$;