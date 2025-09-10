-- Complete cleanup of artists table and related data
-- This removes all existing artists to allow fresh start

-- First, clean up any related pivot table data (even though currently empty)
DELETE FROM public.artist_genres;
DELETE FROM public.artist_roles;
DELETE FROM public.artists_categories;
DELETE FROM public.artists_genres;
DELETE FROM public.artists_artist_types;

-- Clean up any agenda item artists relationships
DELETE FROM public.agenda_item_artists;

-- Now delete all artists
DELETE FROM public.artists;

-- Add audit log entry for this mass deletion
INSERT INTO public.admin_audit_log (
  admin_email,
  action,
  table_name,
  record_id,
  new_values
) VALUES (
  'system',
  'MASS_DELETE',
  'artists',
  gen_random_uuid(),
  jsonb_build_object(
    'operation', 'complete_cleanup',
    'reason', 'fresh_start_requested',
    'timestamp', NOW(),
    'tables_affected', ARRAY['artists', 'artist_genres', 'artist_roles', 'artists_categories', 'artists_genres', 'artists_artist_types', 'agenda_item_artists']
  )
);