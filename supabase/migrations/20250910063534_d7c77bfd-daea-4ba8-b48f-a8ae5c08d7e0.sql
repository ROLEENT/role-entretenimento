-- Correções de Segurança Críticas - Fase 6.2 (Corrigida)

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

-- 3. Remover função existente e recriar com melhoria
DROP FUNCTION IF EXISTS public.log_security_event(text,uuid,text,jsonb,text);

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
EXCEPTION
  WHEN OTHERS THEN
    -- Falha silenciosa para não quebrar operações críticas
    NULL;
END;
$$;

-- 4. Melhorar função is_admin_user
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
  
  -- Tentar log (não crítico se falhar)
  BEGIN
    PERFORM log_security_event(
      'admin_access_check',
      auth.uid(),
      admin_email,
      jsonb_build_object('result', is_admin, 'email', admin_email),
      CASE WHEN is_admin THEN 'info' ELSE 'warning' END
    );
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
  
  RETURN is_admin;
END;
$$;