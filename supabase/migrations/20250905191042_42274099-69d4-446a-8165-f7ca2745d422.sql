-- Corrigir problemas críticos de segurança identificados pelo linter

-- 1. Primeiro, identificar e corrigir as views SECURITY DEFINER problemáticas
-- Vamos remover SECURITY DEFINER das views que não precisam (geralmente são views de dados públicos)

-- 2. Corrigir funções sem search_path configurado
-- Adicionando SET search_path = public a todas as funções que não têm

-- Corrigir função is_admin_session_valid
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  )
$$;

-- Corrigir função validate_admin_email
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_to_validate text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = email_to_validate AND is_active = true
  )
$$;

-- Corrigir função check_user_is_admin
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Corrigir função check_user_is_editor_or_admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
$$;

-- Corrigir função auth_role
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()),
    'viewer'
  )
$$;

-- Criar função para obter role do usuário atual de forma segura
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.user_profiles WHERE user_id = auth.uid()),
    'viewer'
  )
$$;

-- Corrigir outras funções que podem estar sem search_path
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
  id uuid, stage_name text, artist_type text, city text, 
  instagram text, booking_email text, booking_whatsapp text,
  bio_short text, profile_image_url text, slug text,
  created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_valid boolean;
  new_artist_id uuid;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Criar artista
  INSERT INTO public.artists (
    stage_name, artist_type, city, instagram, booking_email,
    booking_whatsapp, bio_short, profile_image_url, slug, bio_long,
    real_name, pronouns, home_city, fee_range, website_url,
    spotify_url, soundcloud_url, youtube_url, beatport_url,
    audius_url, responsible_name, responsible_role, image_credits,
    cover_image_url, accommodation_notes, tech_rider_url, presskit_url,
    show_format, team_size, set_time_minutes, tech_stage, tech_audio,
    tech_light, internal_notes, cities_active, availability_days,
    priority, status, image_rights_authorized
  ) VALUES (
    p_stage_name, p_artist_type, p_city, p_instagram, p_booking_email,
    p_booking_whatsapp, p_bio_short, p_profile_image_url, p_slug, p_bio_long,
    p_real_name, p_pronouns, p_home_city, p_fee_range, p_website_url,
    p_spotify_url, p_soundcloud_url, p_youtube_url, p_beatport_url,
    p_audius_url, p_responsible_name, p_responsible_role, p_image_credits,
    p_cover_image_url, p_accommodation_notes, p_tech_rider_url, p_presskit_url,
    p_show_format, p_team_size, p_set_time_minutes, p_tech_stage, p_tech_audio,
    p_tech_light, p_internal_notes, COALESCE(p_cities_active, '{}'), 
    COALESCE(p_availability_days, '{}'), p_priority, p_status, p_image_rights_authorized
  ) RETURNING artists.id INTO new_artist_id;

  -- Retornar artista criado
  RETURN QUERY
  SELECT 
    a.id, a.stage_name, a.artist_type, a.city, a.instagram, a.booking_email,
    a.booking_whatsapp, a.bio_short, a.profile_image_url, a.slug,
    a.created_at, a.updated_at
  FROM public.artists a
  WHERE a.id = new_artist_id;
END;
$$;