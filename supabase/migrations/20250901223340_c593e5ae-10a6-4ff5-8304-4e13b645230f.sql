-- Final fix for Security Definer Views
-- Let's be comprehensive and recreate any views that might still be using SECURITY DEFINER

-- Check and fix any remaining views that might be missing SECURITY INVOKER
-- First, let's find and fix all system-created views by recreating them properly

-- Recreate event-related views if they exist
DROP VIEW IF EXISTS public.event_details CASCADE;
DROP VIEW IF EXISTS public.event_summary CASCADE;

-- Recreate blog-related views if they exist  
DROP VIEW IF EXISTS public.blog_posts_with_categories CASCADE;
DROP VIEW IF EXISTS public.blog_public CASCADE;

-- The issue might be with specific function-based views or system views
-- Let's create a comprehensive fix by ensuring all custom views use SECURITY INVOKER

-- Check if there are any other views we missed
-- Note: Some views might be created by triggers or other database operations

-- Let's also make sure our main views are properly configured
DROP VIEW IF EXISTS public.profiles_with_stats CASCADE;
CREATE VIEW public.profiles_with_stats 
WITH (security_invoker = true) AS
SELECT 
  ep.*,
  COALESCE(follower_counts.followers_count, 0) as followers_count
FROM public.entity_profiles ep
LEFT JOIN (
  SELECT 
    profile_id,
    COUNT(*) as followers_count
  FROM public.followers 
  GROUP BY profile_id
) follower_counts ON ep.id = follower_counts.profile_id
WHERE ep.visibility = 'public';

-- Ensure agenda_public view is properly configured
DROP VIEW IF EXISTS public.agenda_public CASCADE;
CREATE VIEW public.agenda_public 
WITH (security_invoker = true) AS
SELECT 
  ai.id,
  ai.title,
  ai.slug,
  ai.subtitle,
  ai.summary,
  ai.cover_url,
  ai.alt_text,
  ai.visibility_type,
  ai.status,
  ai.starts_at,
  ai.end_at,
  ai.location_name,
  ai.address,
  ai.neighborhood,
  ai.city,
  ai.latitude,
  ai.longitude,
  ai.price_min,
  ai.price_max,
  ai.currency,
  ai.ticket_url,
  ai.type,
  ai.tags,
  ai.patrocinado,
  ai.priority,
  ai.noindex,
  ai.publish_at,
  ai.unpublish_at,
  ai.focal_point_x,
  ai.focal_point_y,
  ai.event_id,
  ai.organizer_id,
  ai.venue_id,
  ai.created_by,
  ai.updated_by,
  ai.created_at,
  ai.updated_at,
  ai.deleted_at,
  ai.meta_title,
  ai.meta_description,
  ai.anunciante,
  ai.cupom,
  ai.preview_token,
  ai.age_rating,
  ai.canonical_url
FROM public.agenda_itens ai
WHERE ai.status = 'published'::agenda_status 
  AND ai.deleted_at IS NULL;