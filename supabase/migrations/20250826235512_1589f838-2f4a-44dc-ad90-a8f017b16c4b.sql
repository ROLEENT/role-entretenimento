-- Fix 7 vulnerable functions by adding SET search_path TO 'public'
-- This prevents SQL injection through search_path manipulation

-- 1. Fix validate_admin_email function (create if not exists)
CREATE OR REPLACE FUNCTION public.validate_admin_email(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = user_email AND is_active = true
  );
END;
$$;

-- 2. Fix admin_create_event function
CREATE OR REPLACE FUNCTION public.admin_create_event(
    p_title text,
    p_slug text,
    p_city text,
    p_start_at timestamp with time zone,
    p_venue_id uuid DEFAULT NULL,
    p_end_at timestamp with time zone DEFAULT NULL,
    p_organizer_id uuid DEFAULT NULL,
    p_cover_url text DEFAULT NULL,
    p_tags text[] DEFAULT '{}',
    p_status text DEFAULT 'active',
    p_description text DEFAULT NULL
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    new_event_id uuid;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: admin role required';
    END IF;

    INSERT INTO public.events (
        title, slug, city, start_at, end_at, venue_id, organizer_id,
        cover_url, tags, status, description
    ) VALUES (
        p_title, p_slug, p_city, p_start_at, p_end_at, p_venue_id, p_organizer_id,
        p_cover_url, p_tags, p_status, p_description
    ) RETURNING id INTO new_event_id;

    RETURN new_event_id;
END;
$$;

-- 3. Fix admin_update_event function
CREATE OR REPLACE FUNCTION public.admin_update_event(
    p_event_id uuid,
    p_title text,
    p_slug text,
    p_city text,
    p_start_at timestamp with time zone,
    p_venue_id uuid DEFAULT NULL,
    p_end_at timestamp with time zone DEFAULT NULL,
    p_organizer_id uuid DEFAULT NULL,
    p_cover_url text DEFAULT NULL,
    p_tags text[] DEFAULT '{}',
    p_status text DEFAULT 'active',
    p_description text DEFAULT NULL
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: admin role required';
    END IF;

    UPDATE public.events SET
        title = p_title,
        slug = p_slug,
        city = p_city,
        start_at = p_start_at,
        end_at = p_end_at,
        venue_id = p_venue_id,
        organizer_id = p_organizer_id,
        cover_url = p_cover_url,
        tags = p_tags,
        status = p_status,
        description = p_description,
        updated_at = now()
    WHERE id = p_event_id;

    RETURN FOUND;
END;
$$;

-- 4. Fix create_activity function
CREATE OR REPLACE FUNCTION public.create_activity(
    p_actor_id uuid,
    p_type text,
    p_object_type text DEFAULT NULL,
    p_object_id uuid DEFAULT NULL,
    p_data jsonb DEFAULT '{}'
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    activity_id uuid;
BEGIN
    INSERT INTO public.activity_feed (
        user_id, actor_id, type, object_type, object_id, data
    ) VALUES (
        p_actor_id, p_actor_id, p_type, p_object_type, p_object_id, p_data
    ) RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$;

-- 5. Fix add_user_points function
CREATE OR REPLACE FUNCTION public.add_user_points(
    p_user_id uuid,
    p_points integer,
    p_activity_type text,
    p_object_id uuid DEFAULT NULL,
    p_description text DEFAULT NULL
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
    -- Insert into points history
    INSERT INTO public.user_points_history (
        user_id, points, activity_type, object_id, description
    ) VALUES (
        p_user_id, p_points, p_activity_type, p_object_id, p_description
    );

    -- Update user total points
    INSERT INTO public.user_points (user_id, total_points, last_activity)
    VALUES (p_user_id, p_points, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_points = user_points.total_points + p_points,
        last_activity = now();
END;
$$;

-- 6. Fix reset_daily_notification_count function
CREATE OR REPLACE FUNCTION public.reset_daily_notification_count()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.user_notification_preferences
    SET daily_count = 0
    WHERE daily_count > 0;
END;
$$;

-- 7. Fix toggle_highlight_like function
CREATE OR REPLACE FUNCTION public.toggle_highlight_like(p_highlight_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    like_exists boolean;
BEGIN
    -- Check if user already liked this highlight
    SELECT EXISTS(
        SELECT 1 FROM public.highlight_likes
        WHERE highlight_id = p_highlight_id AND user_id = auth.uid()
    ) INTO like_exists;

    IF like_exists THEN
        -- Remove like
        DELETE FROM public.highlight_likes
        WHERE highlight_id = p_highlight_id AND user_id = auth.uid();
        RETURN false;
    ELSE
        -- Add like
        INSERT INTO public.highlight_likes (highlight_id, user_id)
        VALUES (p_highlight_id, auth.uid())
        ON CONFLICT (highlight_id, user_id) DO NOTHING;
        RETURN true;
    END IF;
END;
$$;