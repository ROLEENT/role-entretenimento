-- Final Security Fixes Migration (Minimal Changes)
-- Fix the most critical security issues without changing function signatures

-- 1. Remove SECURITY DEFINER from views and replace with proper access control
DROP VIEW IF EXISTS public.blog_comments_safe CASCADE;
DROP VIEW IF EXISTS public.organizers_public CASCADE;

-- Create safer view for blog comments (no SECURITY DEFINER)
CREATE VIEW public.blog_comments_safe AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  created_at,
  parent_id,
  is_approved
FROM public.blog_comments
WHERE is_approved = true;

-- Create safer view for organizers (no SECURITY DEFINER, no emails)
CREATE VIEW public.organizers_public AS
SELECT 
  id,
  name,
  site,
  instagram,
  created_at,
  updated_at
FROM public.organizers;

-- Grant public read access to the safe views
GRANT SELECT ON public.blog_comments_safe TO anon, authenticated;
GRANT SELECT ON public.organizers_public TO anon, authenticated;

-- 2. Hide email fields from public access via column-level grants

-- Revoke all access to organizers for anon users
REVOKE ALL ON public.organizers FROM anon;
-- Grant only safe columns to anon users
GRANT SELECT (id, name, site, instagram, created_at, updated_at) ON public.organizers TO anon;

-- Revoke all access to partners for anon users  
REVOKE ALL ON public.partners FROM anon;
-- Grant only safe columns to anon users
GRANT SELECT (id, name, location, website, instagram, image_url, featured, rating, capacity, types, created_at, updated_at) ON public.partners TO anon;

-- Ensure authenticated users get full access
GRANT SELECT ON public.organizers TO authenticated;
GRANT SELECT ON public.partners TO authenticated;

-- 3. Create admin-only functions to access sensitive data
CREATE OR REPLACE FUNCTION public.get_organizer_admin_data(organizer_id uuid)
RETURNS TABLE(id uuid, name text, contact_email text, site text, instagram text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.contact_email,
    o.site,
    o.instagram,
    o.created_at,
    o.updated_at
  FROM public.organizers o
  WHERE o.id = organizer_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_partner_admin_data(partner_id uuid)
RETURNS TABLE(id uuid, name text, contact_email text, location text, website text, instagram text, image_url text, featured boolean, rating numeric, capacity text, types text[], created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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