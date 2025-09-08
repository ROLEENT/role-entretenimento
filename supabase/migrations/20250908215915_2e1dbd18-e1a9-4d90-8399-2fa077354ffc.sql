-- Migration to sync events table to agenda_itens and update admin hook to use unified view

-- First, copy existing events to agenda_itens if they don't exist
INSERT INTO public.agenda_itens (
  id,
  title,
  subtitle,
  summary,
  city,
  address,
  location_name,
  starts_at,
  end_at,
  price_min,
  price_max,
  currency,
  ticket_url,
  cover_url,
  alt_text,
  tags,
  status,
  visibility_type,
  highlight_type,
  is_sponsored,
  patrocinado,
  venue_id,
  organizer_id,
  created_at,
  updated_at,
  slug,
  seo_title,
  seo_description,
  og_image_url,
  ticketing,
  links,
  accessibility,
  event_id -- Reference to original event
)
SELECT 
  e.id,
  e.title,
  e.subtitle,
  e.summary,
  e.city,
  e.address,
  e.location_name,
  e.date_start,
  e.date_end,
  e.price_min,
  e.price_max,
  e.currency,
  e.ticket_url,
  e.cover_url,
  e.cover_alt,
  e.tags,
  e.status::agenda_status,
  'curadoria'::agenda_visibility,
  e.highlight_type,
  e.is_sponsored,
  e.is_sponsored,
  e.venue_id,
  NULL, -- organizer_id (events table doesn't have this)
  e.created_at,
  e.updated_at,
  e.slug,
  e.seo_title,
  e.seo_description,
  e.og_image_url,
  e.ticketing,
  e.links,
  e.accessibility,
  e.id -- Keep reference to original event
FROM public.events e
WHERE NOT EXISTS (
  SELECT 1 FROM public.agenda_itens a 
  WHERE a.event_id = e.id OR a.id = e.id
)
AND e.status = 'published';