-- Create RPC functions for admin artist management following highlights pattern

-- Function to create a new artist
CREATE OR REPLACE FUNCTION public.admin_create_artist(
  p_admin_email text,
  p_stage_name text,
  p_artist_type text,
  p_city text,
  p_instagram text,
  p_booking_email text,
  p_booking_whatsapp text,
  p_bio_short text,
  p_profile_image_url text,
  p_slug text,
  p_bio_long text DEFAULT NULL,
  p_real_name text DEFAULT NULL,
  p_pronouns text DEFAULT NULL,
  p_home_city text DEFAULT NULL,
  p_fee_range text DEFAULT NULL,
  p_website_url text DEFAULT NULL,
  p_spotify_url text DEFAULT NULL,
  p_soundcloud_url text DEFAULT NULL,
  p_youtube_url text DEFAULT NULL,
  p_beatport_url text DEFAULT NULL,
  p_audius_url text DEFAULT NULL,
  p_responsible_name text DEFAULT NULL,
  p_responsible_role text DEFAULT NULL,
  p_image_credits text DEFAULT NULL,
  p_cover_image_url text DEFAULT NULL,
  p_accommodation_notes text DEFAULT NULL,
  p_tech_rider_url text DEFAULT NULL,
  p_presskit_url text DEFAULT NULL,
  p_show_format text DEFAULT NULL,
  p_team_size integer DEFAULT NULL,
  p_set_time_minutes integer DEFAULT NULL,
  p_tech_stage text DEFAULT NULL,
  p_tech_audio text DEFAULT NULL,
  p_tech_light text DEFAULT NULL,
  p_internal_notes text DEFAULT NULL,
  p_cities_active text[] DEFAULT '{}',
  p_availability_days text[] DEFAULT '{}',
  p_priority integer DEFAULT 0,
  p_status text DEFAULT 'active',
  p_image_rights_authorized boolean DEFAULT false
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
DECLARE
  new_artist_id uuid;
  admin_valid boolean;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Validar dados obrigatórios
  IF p_stage_name IS NULL OR length(trim(p_stage_name)) = 0 THEN
    RAISE EXCEPTION 'Nome artístico é obrigatório';
  END IF;
  
  IF p_artist_type IS NULL OR length(trim(p_artist_type)) = 0 THEN
    RAISE EXCEPTION 'Tipo de artista é obrigatório';
  END IF;
  
  IF p_city IS NULL OR length(trim(p_city)) = 0 THEN
    RAISE EXCEPTION 'Cidade é obrigatória';
  END IF;
  
  IF p_instagram IS NULL OR length(trim(p_instagram)) = 0 THEN
    RAISE EXCEPTION 'Instagram é obrigatório';
  END IF;
  
  IF p_booking_email IS NULL OR length(trim(p_booking_email)) = 0 THEN
    RAISE EXCEPTION 'Email de contato é obrigatório';
  END IF;
  
  IF p_booking_whatsapp IS NULL OR length(trim(p_booking_whatsapp)) = 0 THEN
    RAISE EXCEPTION 'WhatsApp é obrigatório';
  END IF;
  
  IF p_bio_short IS NULL OR length(trim(p_bio_short)) = 0 THEN
    RAISE EXCEPTION 'Bio curta é obrigatória';
  END IF;
  
  IF p_profile_image_url IS NULL OR length(trim(p_profile_image_url)) = 0 THEN
    RAISE EXCEPTION 'URL da imagem de perfil é obrigatória';
  END IF;

  -- Inserir o artista
  INSERT INTO public.artists (
    stage_name, artist_type, city, instagram, booking_email, booking_whatsapp,
    bio_short, profile_image_url, slug, bio_long, real_name, pronouns,
    home_city, fee_range, website_url, spotify_url, soundcloud_url,
    youtube_url, beatport_url, audius_url, responsible_name, responsible_role,
    image_credits, cover_image_url, accommodation_notes, tech_rider_url,
    presskit_url, show_format, team_size, set_time_minutes, tech_stage,
    tech_audio, tech_light, internal_notes, cities_active, availability_days,
    priority, status, image_rights_authorized
  ) VALUES (
    p_stage_name, p_artist_type, p_city, p_instagram, p_booking_email, p_booking_whatsapp,
    p_bio_short, p_profile_image_url, p_slug, p_bio_long, p_real_name, p_pronouns,
    p_home_city, p_fee_range, p_website_url, p_spotify_url, p_soundcloud_url,
    p_youtube_url, p_beatport_url, p_audius_url, p_responsible_name, p_responsible_role,
    p_image_credits, p_cover_image_url, p_accommodation_notes, p_tech_rider_url,
    p_presskit_url, p_show_format, p_team_size, p_set_time_minutes, p_tech_stage,
    p_tech_audio, p_tech_light, p_internal_notes, COALESCE(p_cities_active, '{}'),
    COALESCE(p_availability_days, '{}'), p_priority, p_status, p_image_rights_authorized
  ) RETURNING artists.id INTO new_artist_id;

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
  WHERE a.id = new_artist_id;
END;
$function$;

-- Function to update an existing artist
CREATE OR REPLACE FUNCTION public.admin_update_artist(
  p_admin_email text,
  p_artist_id uuid,
  p_stage_name text,
  p_artist_type text,
  p_city text,
  p_instagram text,
  p_booking_email text,
  p_booking_whatsapp text,
  p_bio_short text,
  p_profile_image_url text,
  p_slug text,
  p_bio_long text DEFAULT NULL,
  p_real_name text DEFAULT NULL,
  p_pronouns text DEFAULT NULL,
  p_home_city text DEFAULT NULL,
  p_fee_range text DEFAULT NULL,
  p_website_url text DEFAULT NULL,
  p_spotify_url text DEFAULT NULL,
  p_soundcloud_url text DEFAULT NULL,
  p_youtube_url text DEFAULT NULL,
  p_beatport_url text DEFAULT NULL,
  p_audius_url text DEFAULT NULL,
  p_responsible_name text DEFAULT NULL,
  p_responsible_role text DEFAULT NULL,
  p_image_credits text DEFAULT NULL,
  p_cover_image_url text DEFAULT NULL,
  p_accommodation_notes text DEFAULT NULL,
  p_tech_rider_url text DEFAULT NULL,
  p_presskit_url text DEFAULT NULL,
  p_show_format text DEFAULT NULL,
  p_team_size integer DEFAULT NULL,
  p_set_time_minutes integer DEFAULT NULL,
  p_tech_stage text DEFAULT NULL,
  p_tech_audio text DEFAULT NULL,
  p_tech_light text DEFAULT NULL,
  p_internal_notes text DEFAULT NULL,
  p_cities_active text[] DEFAULT '{}',
  p_availability_days text[] DEFAULT '{}',
  p_priority integer DEFAULT 0,
  p_status text DEFAULT 'active',
  p_image_rights_authorized boolean DEFAULT false
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
DECLARE
  admin_valid boolean;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se artista existe
  IF NOT EXISTS (SELECT 1 FROM public.artists WHERE artists.id = p_artist_id) THEN
    RAISE EXCEPTION 'Artista não encontrado';
  END IF;

  -- Atualizar artista
  UPDATE public.artists SET
    stage_name = p_stage_name,
    artist_type = p_artist_type,
    city = p_city,
    instagram = p_instagram,
    booking_email = p_booking_email,
    booking_whatsapp = p_booking_whatsapp,
    bio_short = p_bio_short,
    profile_image_url = p_profile_image_url,
    slug = p_slug,
    bio_long = p_bio_long,
    real_name = p_real_name,
    pronouns = p_pronouns,
    home_city = p_home_city,
    fee_range = p_fee_range,
    website_url = p_website_url,
    spotify_url = p_spotify_url,
    soundcloud_url = p_soundcloud_url,
    youtube_url = p_youtube_url,
    beatport_url = p_beatport_url,
    audius_url = p_audius_url,
    responsible_name = p_responsible_name,
    responsible_role = p_responsible_role,
    image_credits = p_image_credits,
    cover_image_url = p_cover_image_url,
    accommodation_notes = p_accommodation_notes,
    tech_rider_url = p_tech_rider_url,
    presskit_url = p_presskit_url,
    show_format = p_show_format,
    team_size = p_team_size,
    set_time_minutes = p_set_time_minutes,
    tech_stage = p_tech_stage,
    tech_audio = p_tech_audio,
    tech_light = p_tech_light,
    internal_notes = p_internal_notes,
    cities_active = COALESCE(p_cities_active, '{}'),
    availability_days = COALESCE(p_availability_days, '{}'),
    priority = p_priority,
    status = p_status,
    image_rights_authorized = p_image_rights_authorized,
    updated_at = NOW()
  WHERE artists.id = p_artist_id;

  -- Retornar artista atualizado
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
  WHERE a.id = p_artist_id;
END;
$function$;

-- Function to get artist by ID
CREATE OR REPLACE FUNCTION public.admin_get_artist_by_id(
  p_admin_email text,
  p_artist_id uuid
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
  WHERE a.id = p_artist_id;
END;
$function$;

-- Function to delete artist
CREATE OR REPLACE FUNCTION public.admin_delete_artist(
  p_admin_email text,
  p_artist_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se o artista existe
  IF NOT EXISTS (
    SELECT 1 FROM public.artists WHERE id = p_artist_id
  ) THEN
    RAISE EXCEPTION 'Artista não encontrado';
  END IF;

  -- Deletar o artista
  DELETE FROM public.artists WHERE id = p_artist_id;

  RETURN true;
END;
$function$;