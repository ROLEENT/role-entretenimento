-- Final security cleanup to address remaining linter issues

-- 1. Find and fix any Security Definer Views
-- First, let's check if there are any views with SECURITY DEFINER and drop them
-- Common security definer views that might exist:
DROP VIEW IF EXISTS analytics_summary;

-- Recreate analytics_summary as a regular view (not SECURITY DEFINER)
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    event_name,
    city,
    source,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users
FROM public.analytics_events 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), event_name, city, source
ORDER BY date DESC;

-- 2. Create a comprehensive events system with proper security

-- Enhanced event management function
CREATE OR REPLACE FUNCTION public.create_event_secure(
    p_title text,
    p_slug text,
    p_city text,
    p_start_at timestamp with time zone,
    p_venue_id uuid DEFAULT NULL,
    p_organizer_id uuid DEFAULT NULL,
    p_description text DEFAULT NULL,
    p_cover_url text DEFAULT NULL,
    p_tags text[] DEFAULT '{}',
    p_price_min numeric DEFAULT NULL,
    p_price_max numeric DEFAULT NULL
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    new_event_id uuid;
    user_role user_role;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Get user role
    SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
    
    -- Check if user can create events (admin or organizer)
    IF user_role NOT IN ('admin', 'organizer') THEN
        RAISE EXCEPTION 'Insufficient permissions: admin or organizer role required';
    END IF;

    -- Create the event
    INSERT INTO public.events (
        title, slug, city, start_at, venue_id, organizer_id,
        description, cover_url, tags, price_min, price_max, status
    ) VALUES (
        p_title, p_slug, p_city, p_start_at, p_venue_id, p_organizer_id,
        p_description, p_cover_url, p_tags, p_price_min, p_price_max, 'active'
    ) RETURNING id INTO new_event_id;

    -- Log the creation
    PERFORM public.create_activity(
        auth.uid(),
        'event_created',
        'event',
        new_event_id,
        jsonb_build_object('title', p_title, 'city', p_city)
    );

    RETURN new_event_id;
END;
$$;

-- Event update function
CREATE OR REPLACE FUNCTION public.update_event_secure(
    p_event_id uuid,
    p_title text,
    p_description text DEFAULT NULL,
    p_start_at timestamp with time zone DEFAULT NULL,
    p_venue_id uuid DEFAULT NULL,
    p_cover_url text DEFAULT NULL,
    p_tags text[] DEFAULT NULL,
    p_price_min numeric DEFAULT NULL,
    p_price_max numeric DEFAULT NULL
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    user_role user_role;
    event_organizer_id uuid;
BEGIN
    -- Check authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Get user role and event organizer
    SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
    SELECT organizer_id INTO event_organizer_id FROM public.events WHERE id = p_event_id;
    
    -- Check permissions (admin or event organizer)
    IF user_role != 'admin' AND event_organizer_id != auth.uid() THEN
        RAISE EXCEPTION 'Insufficient permissions to update this event';
    END IF;

    -- Update the event
    UPDATE public.events SET
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        start_at = COALESCE(p_start_at, start_at),
        venue_id = COALESCE(p_venue_id, venue_id),
        cover_url = COALESCE(p_cover_url, cover_url),
        tags = COALESCE(p_tags, tags),
        price_min = COALESCE(p_price_min, price_min),
        price_max = COALESCE(p_price_max, price_max),
        updated_at = now()
    WHERE id = p_event_id;

    -- Log the update
    PERFORM public.create_activity(
        auth.uid(),
        'event_updated',
        'event',
        p_event_id,
        jsonb_build_object('title', p_title)
    );

    RETURN FOUND;
END;
$$;

-- Event deletion function
CREATE OR REPLACE FUNCTION public.delete_event_secure(p_event_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    user_role user_role;
    event_organizer_id uuid;
    event_title text;
BEGIN
    -- Check authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Get user role, event organizer, and title
    SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
    SELECT organizer_id, title INTO event_organizer_id, event_title 
    FROM public.events WHERE id = p_event_id;
    
    -- Check permissions (admin or event organizer)
    IF user_role != 'admin' AND event_organizer_id != auth.uid() THEN
        RAISE EXCEPTION 'Insufficient permissions to delete this event';
    END IF;

    -- Soft delete the event (change status instead of hard delete)
    UPDATE public.events SET
        status = 'deleted',
        updated_at = now()
    WHERE id = p_event_id;

    -- Log the deletion
    PERFORM public.create_activity(
        auth.uid(),
        'event_deleted',
        'event',
        p_event_id,
        jsonb_build_object('title', event_title)
    );

    RETURN FOUND;
END;
$$;