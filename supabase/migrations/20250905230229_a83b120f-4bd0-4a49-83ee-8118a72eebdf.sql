-- Drop existing function and recreate with proper PLPGSQL syntax
DROP FUNCTION IF EXISTS public.soft_delete_event(uuid);

-- Create proper soft delete function with PLPGSQL and SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.soft_delete_event(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin (using auth.uid() instead of headers)
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Perform soft delete
  UPDATE public.events 
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_event_id AND deleted_at IS NULL;

  -- Check if event was found and updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or already deleted';
  END IF;
  
  -- Log the action for audit
  PERFORM public.log_security_event(
    'event_soft_delete',
    NULL,
    ((current_setting('request.headers', true))::json ->> 'x-admin-email'),
    jsonb_build_object('event_id', p_event_id),
    'info'
  );
END;
$$;