-- Get list of artists for admin
CREATE OR REPLACE FUNCTION public.admin_get_artists(
  p_admin_email text,
  p_city text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_status text DEFAULT 'active'
)
RETURNS TABLE(
  id uuid,
  stage_name text,
  artist_type text,
  city text,
  instagram text,
  booking_email text,
  booking_whatsapp text,
  bio_short text,
  profile_image_url text,
  slug text,
  bio_long text,
  real_name text,
  pronouns text,
  home_city text,
  fee_range text,
  website_url text,
  spotify_url text,
  soundcloud_url text,
  youtube_url text,
  beatport_url text,
  audius_url text,
  responsible_name text,
  responsible_role text,
  image_credits text,
  cover_image_url text,
  accommodation_notes text,
  tech_rider_url text,
  presskit_url text,
  show_format text,
  team_size integer,
  set_time_minutes integer,
  tech_stage text,
  tech_audio text,
  tech_light text,
  internal_notes text,
  cities_active text[],
  availability_days text[],
  priority integer,
  status text,
  image_rights_authorized boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  RETURN QUERY
  SELECT 
    a.id, a.stage_name, a.artist_type, a.city, a.instagram, a.booking_email,
    a.booking_whatsapp, a.bio_short, a.profile_image_url, a.slug, a.bio_long,
    a.real_name, a.pronouns, a.home_city, a.fee_range, a.website_url,
    a.spotify_url, a.soundcloud_url, a.youtube_url, a.beatport_url,
    a.audius_url, a.responsible_name, a.responsible_role, a.image_credits,
    a.cover_image_url, a.accommodation_notes, a.tech_rider_url, a.presskit_url,
    a.show_format, a.team_size, a.set_time_minutes, a.tech_stage, a.tech_audio,
    a.tech_light, a.internal_notes, a.cities_active, a.availability_days,
    a.priority, a.status, a.image_rights_authorized, a.created_at, a.updated_at
  FROM public.artists a
  WHERE 
    (p_city IS NULL OR a.city = p_city)
    AND (p_status IS NULL OR a.status = p_status)
    AND (p_search IS NULL OR a.stage_name ILIKE '%' || p_search || '%')
  ORDER BY a.created_at DESC;
END;
$function$;