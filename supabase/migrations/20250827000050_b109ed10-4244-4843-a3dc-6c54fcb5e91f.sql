-- Fix remaining security functions by adding SET search_path TO 'public'
-- First, let's complete the remaining vulnerable functions

-- Fix create_activity function
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

-- Fix add_user_points function
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

-- Fix reset_daily_notification_count function
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

-- Fix toggle_highlight_like function
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

-- Fix toggle_blog_like function (if exists)
CREATE OR REPLACE FUNCTION public.toggle_blog_like(p_post_id uuid, p_email_hash text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    like_exists boolean;
BEGIN
    -- Check if user already liked this post
    SELECT EXISTS(
        SELECT 1 FROM public.blog_likes
        WHERE post_id = p_post_id AND email_hash = p_email_hash
    ) INTO like_exists;

    IF like_exists THEN
        -- Remove like
        DELETE FROM public.blog_likes
        WHERE post_id = p_post_id AND email_hash = p_email_hash;
        RETURN false;
    ELSE
        -- Add like
        INSERT INTO public.blog_likes (post_id, email_hash)
        VALUES (p_post_id, p_email_hash)
        ON CONFLICT (post_id, email_hash) DO NOTHING;
        RETURN true;
    END IF;
END;
$$;

-- Fix get_admin_session function (if exists)
CREATE OR REPLACE FUNCTION public.get_admin_session(p_session_token text)
 RETURNS TABLE(admin_id uuid, email text, full_name text, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.admin_id,
        a.email,
        a.full_name,
        s.expires_at
    FROM public.admin_sessions s
    JOIN public.admin_users a ON s.admin_id = a.id
    WHERE s.session_token = p_session_token
      AND s.expires_at > NOW()
      AND a.is_active = true;
END;
$$;