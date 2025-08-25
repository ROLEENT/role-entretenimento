-- Final Security Fixes Migration
-- Fix all remaining security issues found in the scan

-- 1. Remove SECURITY DEFINER from views and replace with proper access control
DROP VIEW IF EXISTS public.blog_comments_safe;
DROP VIEW IF EXISTS public.organizers_public;

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

-- 2. Strengthen RLS policies - hide email fields from public access

-- Update organizers RLS to hide emails from public
DROP POLICY IF EXISTS "Public can view organizer safe info" ON public.organizers;
CREATE POLICY "Public can view organizer basic info" ON public.organizers
FOR SELECT USING (true);

-- But restrict email access via grants
REVOKE ALL ON public.organizers FROM anon;
GRANT SELECT (id, name, site, instagram, created_at, updated_at) ON public.organizers TO anon;

-- Update partners RLS to hide emails from public  
DROP POLICY IF EXISTS "Public can view partner basic info" ON public.partners;
CREATE POLICY "Public can view partner basic info" ON public.partners
FOR SELECT USING (true);

-- But restrict email access via grants
REVOKE ALL ON public.partners FROM anon;
GRANT SELECT (id, name, location, website, instagram, image_url, featured, rating, capacity, types, created_at, updated_at) ON public.partners TO anon;

-- Ensure authenticated users get full access
GRANT SELECT ON public.organizers TO authenticated;
GRANT SELECT ON public.partners TO authenticated;

-- 3. Add search_path to functions that are missing it
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  session_email text;
BEGIN
  -- Try to get email from admin session headers
  session_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF session_email IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_admin_email(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = user_email AND is_active = true
  );
$$;

-- 4. Create admin-only function to get sensitive organizer data
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

-- 5. Create admin-only function to get sensitive partner data
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

-- 6. Ensure all admin functions have proper search_path
CREATE OR REPLACE FUNCTION public.debug_admin_operations(admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_exists boolean;
  partners_count integer;
  ads_count integer;
  result jsonb;
BEGIN
  -- Check if admin exists
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = admin_email AND is_active = true
  ) INTO admin_exists;
  
  -- Try to count partners and ads to test RLS
  SELECT COUNT(*) FROM public.partners INTO partners_count;
  SELECT COUNT(*) FROM public.advertisements INTO ads_count;
  
  result := jsonb_build_object(
    'admin_exists', admin_exists,
    'admin_email', admin_email,
    'partners_count', partners_count,
    'ads_count', ads_count,
    'test_timestamp', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM,
    'admin_email', admin_email
  );
END;
$$;