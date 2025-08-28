-- Create activity function for feed system
CREATE OR REPLACE FUNCTION public.create_activity(
  p_user_id uuid,
  p_actor_id uuid,
  p_type text,
  p_object_type text,
  p_object_id uuid,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.activity_feed (
    user_id,
    actor_id,
    type,
    object_type,
    object_id,
    data
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_type,
    p_object_type,
    p_object_id,
    p_data
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;