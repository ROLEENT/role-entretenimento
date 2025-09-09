-- Limpar função duplicada e criar versão corrigida
DROP FUNCTION IF EXISTS public.admin_delete_event(uuid);
DROP FUNCTION IF EXISTS public.admin_delete_event(text, uuid);

-- Criar função corrigida para exclusão de eventos por admin
CREATE OR REPLACE FUNCTION public.admin_delete_event(p_admin_email text, p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_valid boolean;
  event_exists boolean;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado: admin não encontrado ou inativo',
      'admin_email', p_admin_email
    );
  END IF;

  -- Verificar se evento existe
  SELECT EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id) INTO event_exists;
  
  IF NOT event_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Evento não encontrado',
      'event_id', p_event_id
    );
  END IF;

  -- Excluir evento (soft delete)
  UPDATE public.events 
  SET 
    deleted_at = NOW(),
    updated_at = NOW(),
    updated_by = NULL
  WHERE id = p_event_id;

  -- Log da operação
  PERFORM log_security_event(
    'event_deletion',
    NULL,
    p_admin_email,
    jsonb_build_object('event_id', p_event_id),
    'info'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Evento excluído com sucesso',
    'event_id', p_event_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_detail', SQLSTATE,
    'admin_email', p_admin_email,
    'event_id', p_event_id
  );
END;
$function$;