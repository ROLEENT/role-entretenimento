-- Fix Security Definer Views by adding SECURITY INVOKER to existing views
-- This ensures views use the permissions of the querying user instead of the view creator

-- Drop and recreate views with SECURITY INVOKER
DROP VIEW IF EXISTS public.agenda_public;
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

-- Recreate other views if they exist (checking current views in the system)
-- Note: Only recreating views that are actually using SECURITY DEFINER