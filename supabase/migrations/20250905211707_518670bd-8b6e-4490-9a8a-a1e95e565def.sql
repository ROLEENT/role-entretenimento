-- Update admin_delete_event to use unified validation
CREATE OR REPLACE FUNCTION public.admin_delete_event(
  p_admin_email text,
  p_event_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_exists boolean;
BEGIN
  -- Validate admin using unified function
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Access denied: invalid admin session'
    );
  END IF;

  -- Check if event exists in either table
  SELECT EXISTS(
    SELECT 1 FROM public.events WHERE id = p_event_id
    UNION
    SELECT 1 FROM public.agenda_itens WHERE id = p_event_id
  ) INTO event_exists;

  IF NOT event_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Event not found'
    );
  END IF;

  -- Delete from events table first
  DELETE FROM public.events WHERE id = p_event_id;
  
  -- If not found in events, try agenda_itens
  IF NOT FOUND THEN
    DELETE FROM public.agenda_itens WHERE id = p_event_id;
  END IF;

  -- Log the deletion
  PERFORM log_security_event(
    'event_deleted',
    null,
    p_admin_email,
    jsonb_build_object('event_id', p_event_id),
    'info'
  );

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;