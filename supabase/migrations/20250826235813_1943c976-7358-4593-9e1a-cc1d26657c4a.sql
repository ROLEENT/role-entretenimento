-- Drop function with CASCADE to remove dependencies
DROP FUNCTION IF EXISTS public.validate_admin_email(text) CASCADE;

-- Recreate the function with proper security
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

-- Recreate the policy that was dropped
DROP POLICY IF EXISTS "Admins can manage approved admins safely" ON public.approved_admins;
CREATE POLICY "Admins can manage approved admins safely" ON public.approved_admins
FOR ALL TO authenticated
USING (public.validate_admin_email(auth.email()));

-- Now fix the remaining vulnerable functions with proper search_path

-- Fix admin_create_event function (if exists)
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

-- Fix admin_update_event function (if exists)
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