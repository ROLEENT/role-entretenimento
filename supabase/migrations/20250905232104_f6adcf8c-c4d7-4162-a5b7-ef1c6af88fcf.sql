-- Drop the problematic function completely
DROP FUNCTION IF EXISTS public.soft_delete_event(uuid);

-- Create the simplest possible working version
CREATE OR REPLACE FUNCTION public.soft_delete_event(p_event_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple admin check using the existing is_admin_session_valid function
  IF NOT is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) THEN
    RETURN false;
  END IF;

  -- Simple update with deleted_at
  UPDATE public.events 
  SET deleted_at = now()
  WHERE id = p_event_id AND deleted_at IS NULL;

  -- Return true if successful
  RETURN FOUND;
END;
$$;