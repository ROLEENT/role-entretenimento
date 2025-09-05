-- Create views for active and trash events
CREATE OR REPLACE VIEW public.events_active AS
SELECT * FROM public.events WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.events_trash AS  
SELECT * FROM public.events WHERE deleted_at IS NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS events_deleted_at_idx ON public.events(deleted_at);

-- Soft delete events in bulk
CREATE OR REPLACE FUNCTION public.soft_delete_events(p_ids uuid[])
RETURNS void 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public 
AS $$
  UPDATE public.events
  SET deleted_at = now(), status = 'draft'
  WHERE id = ANY(p_ids);
$$;

-- Restore single event
CREATE OR REPLACE FUNCTION public.restore_event(p_event_id uuid)
RETURNS void 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public 
AS $$
  UPDATE public.events
  SET deleted_at = null
  WHERE id = p_event_id;
$$;

-- Restore events in bulk
CREATE OR REPLACE FUNCTION public.restore_events(p_ids uuid[])
RETURNS void 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public 
AS $$
  UPDATE public.events
  SET deleted_at = null
  WHERE id = ANY(p_ids);
$$;

-- Hard delete single event with cascade
CREATE OR REPLACE FUNCTION public.hard_delete_event(p_event_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  -- Delete child relationships first
  DELETE FROM public.event_partners WHERE event_id = p_event_id;
  DELETE FROM public.event_lineup_slots WHERE event_id = p_event_id;
  DELETE FROM public.event_performances WHERE event_id = p_event_id;
  DELETE FROM public.event_visual_artists WHERE event_id = p_event_id;
  DELETE FROM public.event_curation_criteria WHERE event_id = p_event_id;
  
  -- Finally delete the event
  DELETE FROM public.events WHERE id = p_event_id;
END $$;

-- Hard delete events in bulk
CREATE OR REPLACE FUNCTION public.hard_delete_events(p_ids uuid[])
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  v_id uuid;
BEGIN
  FOREACH v_id IN ARRAY p_ids LOOP
    PERFORM public.hard_delete_event(v_id);
  END LOOP;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION 
  public.soft_delete_events(uuid[]),
  public.restore_event(uuid),
  public.restore_events(uuid[]),
  public.hard_delete_event(uuid),
  public.hard_delete_events(uuid[])
TO authenticated;