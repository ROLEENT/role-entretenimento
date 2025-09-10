-- CORREÇÃO ADICIONAL: Mais funções sem search_path

-- 1. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. get_organizer_public_safe
CREATE OR REPLACE FUNCTION public.get_organizer_public_safe(p_organizer_id uuid)
RETURNS TABLE(id uuid, name text, site text, instagram text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    o.id,
    o.name,
    o.site,
    o.instagram,
    o.created_at,
    o.updated_at
  FROM public.organizers o
  WHERE o.id = p_organizer_id;
$$;

-- 3. get_partner_admin_data
CREATE OR REPLACE FUNCTION public.get_partner_admin_data(partner_id uuid)
RETURNS TABLE(id uuid, name text, contact_email text, location text, website text, instagram text, image_url text, featured boolean, rating numeric, capacity text, types text[], created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.contact_email,
    p.location,
    p.website,
    p.instagram,
    p.image_url,
    p.featured,
    p.rating,
    p.capacity,
    p.types,
    p.created_at,
    p.updated_at
  FROM public.partners p
  WHERE p.id = partner_id;
END;
$$;

-- 4. find_security_definer_views
CREATE OR REPLACE FUNCTION public.find_security_definer_views()
RETURNS TABLE(view_name text, view_definition text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    table_name::text,
    view_definition::text
  FROM information_schema.views 
  WHERE table_schema = 'public'
  AND view_definition ILIKE '%SECURITY DEFINER%'
$$;