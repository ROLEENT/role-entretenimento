-- 6. Drop and recreate is_admin_session_valid function
DROP FUNCTION IF EXISTS public.is_admin_session_valid(text);

CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = session_email AND is_active = true
  )
$$;

-- 7. Atualizar função soft_delete_event para usar approved_admins
CREATE OR REPLACE FUNCTION public.soft_delete_event(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Obter email do admin dos headers
  admin_email := (current_setting('request.headers', true))::json ->> 'x-admin-email';
  
  -- Verificar se é admin válido
  IF NOT EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', admin_email;
  END IF;

  -- Fazer soft delete do evento
  UPDATE public.events
  SET deleted_at = NOW(), status = 'draft', updated_at = NOW()
  WHERE id = p_event_id AND deleted_at IS NULL;
  
  -- Log da operação
  PERFORM public.log_security_event(
    'event_soft_delete',
    NULL,
    admin_email,
    jsonb_build_object('event_id', p_event_id),
    'info'
  );
END;
$$;

-- 8. Criar função para deletar evento via admin com validação completa
CREATE OR REPLACE FUNCTION public.admin_delete_event(p_admin_email text, p_event_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se é admin válido
  IF NOT EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se evento existe
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Evento não encontrado';
  END IF;

  -- Fazer soft delete
  UPDATE public.events
  SET deleted_at = NOW(), status = 'draft', updated_at = NOW()
  WHERE id = p_event_id AND deleted_at IS NULL;

  -- Log da operação
  PERFORM public.log_security_event(
    'admin_event_delete',
    NULL,
    p_admin_email,
    jsonb_build_object('event_id', p_event_id),
    'info'
  );

  RETURN true;
END;
$$;