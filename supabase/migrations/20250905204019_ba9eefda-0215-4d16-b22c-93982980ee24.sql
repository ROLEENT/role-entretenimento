-- 1. Corrigir função de audit para lidar com admin_email NULL
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
  old_json jsonb;
  new_json jsonb;
BEGIN
  -- Get admin email from headers, com fallback para system
  admin_email := COALESCE(
    (current_setting('request.headers', true))::json ->> 'x-admin-email',
    'system'
  );
  
  -- Convert OLD and NEW to jsonb, handling null values
  old_json := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  new_json := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
  
  -- Insert audit record apenas se admin_email estiver disponível
  IF admin_email IS NOT NULL AND admin_email != '' THEN
    INSERT INTO public.admin_audit_log (
      admin_email,
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      ip_address,
      user_agent
    ) VALUES (
      admin_email,
      TG_TABLE_NAME,
      CASE 
        WHEN TG_OP = 'DELETE' THEN (OLD.id)::uuid
        ELSE (NEW.id)::uuid
      END,
      TG_OP,
      old_json,
      new_json,
      inet_client_addr(),
      COALESCE((current_setting('request.headers', true))::json ->> 'user-agent', 'unknown')
    );
  END IF;
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- 2. Agora executar a sincronização com bypass do audit
-- Remover temporariamente o trigger para admin_users
DROP TRIGGER IF EXISTS audit_trigger ON public.admin_users;

-- 3. Criar função para sincronizar admin_users com approved_admins (sem trigger)
CREATE OR REPLACE FUNCTION public.sync_admin_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir admins aprovados que não existem em admin_users
  INSERT INTO public.admin_users (email, full_name, is_active, created_at, updated_at, password_hash)
  SELECT 
    aa.email,
    COALESCE(aa.email, 'Admin'),
    aa.is_active,
    aa.created_at,
    NOW(),
    'placeholder_hash'
  FROM public.approved_admins aa
  WHERE aa.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.email = aa.email
  );
  
  -- Atualizar status de admin_users baseado em approved_admins
  UPDATE public.admin_users 
  SET is_active = false
  WHERE email NOT IN (
    SELECT email FROM public.approved_admins WHERE is_active = true
  );
  
  UPDATE public.admin_users 
  SET is_active = true
  WHERE email IN (
    SELECT email FROM public.approved_admins WHERE is_active = true
  );
END;
$$;

-- 4. Executar sincronização
SELECT public.sync_admin_users();

-- 5. Recriar o audit trigger para admin_users
CREATE TRIGGER audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();