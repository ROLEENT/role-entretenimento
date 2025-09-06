-- Toggle save de evento
CREATE OR REPLACE FUNCTION public.toggle_save(event_id uuid, collection text DEFAULT 'default')
RETURNS TABLE(saved boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.saves s WHERE s.user_id = v_user AND s.event_id = toggle_save.event_id AND s.collection = toggle_save.collection) THEN
    DELETE FROM public.saves
      WHERE user_id = v_user AND event_id = toggle_save.event_id AND collection = toggle_save.collection;
    RETURN QUERY SELECT false AS saved;
  ELSE
    INSERT INTO public.saves (user_id, event_id, collection) VALUES (v_user, toggle_save.event_id, toggle_save.collection);
    RETURN QUERY SELECT true AS saved;
  END IF;
END;
$$;

-- Definir presença
CREATE OR REPLACE FUNCTION public.set_attendance(p_event_id uuid, p_status public.attendance_status, p_show_publicly boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.attendance AS a (user_id, event_id, status, show_publicly)
  VALUES (v_user, p_event_id, p_status, COALESCE(p_show_publicly, true))
  ON CONFLICT (user_id, event_id)
  DO UPDATE SET status = EXCLUDED.status, show_publicly = EXCLUDED.show_publicly, updated_at = now();
END;
$$;

-- Toggle follow
CREATE OR REPLACE FUNCTION public.toggle_follow(p_entity_type text, p_entity_uuid uuid DEFAULT null, p_entity_slug text DEFAULT null)
RETURNS TABLE(following boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_entity_type NOT IN ('artist','venue','organizer','city','tag') THEN
    RAISE EXCEPTION 'invalid entity_type';
  END IF;

  IF p_entity_type IN ('artist','venue','organizer') AND p_entity_uuid IS NULL THEN
    RAISE EXCEPTION 'entity_uuid required for this type';
  END IF;

  IF p_entity_type IN ('city','tag') AND (p_entity_slug IS NULL OR length(p_entity_slug) = 0) THEN
    RAISE EXCEPTION 'entity_slug required for this type';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.follows f
    WHERE f.user_id = v_user
      AND f.entity_type = p_entity_type
      AND COALESCE(f.entity_uuid::text,'') = COALESCE(p_entity_uuid::text,'')
      AND COALESCE(f.entity_slug,'') = COALESCE(p_entity_slug,'')
  ) THEN
    DELETE FROM public.follows
    WHERE user_id = v_user
      AND entity_type = p_entity_type
      AND COALESCE(entity_uuid::text,'') = COALESCE(p_entity_uuid::text,'')
      AND COALESCE(entity_slug,'') = COALESCE(p_entity_slug,'');
    RETURN QUERY SELECT false AS following;
  ELSE
    INSERT INTO public.follows(user_id, entity_type, entity_uuid, entity_slug)
    VALUES (v_user, p_entity_type, p_entity_uuid, p_entity_slug);
    RETURN QUERY SELECT true AS following;
  END IF;
END;
$$;

-- Social do evento com amostra de avatares públicos
CREATE OR REPLACE FUNCTION public.get_event_social(p_event_id uuid, p_limit integer DEFAULT 12)
RETURNS TABLE(
  going_count bigint,
  maybe_count bigint,
  went_count bigint,
  avatars text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH counts AS (
    SELECT
      SUM(CASE WHEN status = 'going' THEN 1 ELSE 0 END)::bigint AS going_count,
      SUM(CASE WHEN status = 'maybe' THEN 1 ELSE 0 END)::bigint AS maybe_count,
      SUM(CASE WHEN status = 'went' THEN 1 ELSE 0 END)::bigint AS went_count
    FROM public.attendance
    WHERE event_id = p_event_id
  ),
  pics AS (
    SELECT up.avatar_url
    FROM public.attendance a
    JOIN public.users_public up ON up.id = a.user_id
    WHERE a.event_id = p_event_id
      AND a.show_publicly = true
      AND up.is_profile_public = true
      AND COALESCE(up.avatar_url,'') <> ''
    ORDER BY a.updated_at DESC
    LIMIT GREATEST(p_limit, 0)
  )
  SELECT
    counts.going_count,
    counts.maybe_count,
    counts.went_count,
    array(SELECT avatar_url FROM pics) AS avatars
  FROM counts;
END;
$$;