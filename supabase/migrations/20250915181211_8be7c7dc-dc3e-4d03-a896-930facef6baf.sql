-- Corrigir funções sem search_path sem quebrar dependências

-- 1. Corrigir função update_updated_at_column (sem drop para não quebrar triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Criar função para verificar se usuário é editor ou admin
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

-- 3. Criar função para verificar role do usuário
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

-- 4. Corrigir função agenda_scheduler
CREATE OR REPLACE FUNCTION public.agenda_scheduler()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Agendar publicação de eventos com publish_at <= now()
  UPDATE public.agenda_itens 
  SET 
    status = 'published'::agenda_status,
    published_at = now(),
    is_published = true
  WHERE publish_at <= now() 
    AND status = 'scheduled'::agenda_status
    AND deleted_at IS NULL;
    
  -- Despublicar eventos com unpublish_at <= now()
  UPDATE public.agenda_itens 
  SET 
    status = 'draft'::agenda_status,
    is_published = false
  WHERE unpublish_at <= now() 
    AND status = 'published'::agenda_status
    AND deleted_at IS NULL;
END;
$function$;

-- 5. Corrigir audit_trigger_function se existir
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