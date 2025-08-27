-- Criar tabela artists baseada no artistSchema.ts
CREATE TABLE public.artists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  stage_name text NOT NULL,
  artist_type text NOT NULL CHECK (artist_type IN ('banda', 'dj', 'solo', 'drag')),
  city text NOT NULL,
  instagram text NOT NULL,
  booking_email text NOT NULL,
  booking_whatsapp text NOT NULL,
  bio_short text NOT NULL,
  profile_image_url text NOT NULL,
  bio_long text,
  cover_image_url text,
  real_name text,
  pronouns text,
  website_url text,
  spotify_url text,
  soundcloud_url text,
  youtube_url text,
  beatport_url text,
  audius_url text,
  presskit_url text,
  show_format text,
  tech_audio text,
  tech_light text,
  tech_stage text,
  tech_rider_url text,
  set_time_minutes integer,
  team_size integer,
  fee_range text,
  home_city text,
  cities_active text[] DEFAULT '{}',
  availability_days text[] DEFAULT '{}',
  accommodation_notes text,
  image_rights_authorized boolean DEFAULT false,
  image_credits text,
  responsible_name text,
  responsible_role text,
  internal_notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  priority integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket artists no Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('artists', 'artists', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Habilitar RLS na tabela artists
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para artists (mesmo padrão dos highlights)
CREATE POLICY "Anyone can view published artists"
ON public.artists FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage artists"
ON public.artists FOR ALL
USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')))
WITH CHECK (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- Políticas de Storage para bucket artists (igual aos highlights)
CREATE POLICY "Public can view artist images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artists');

CREATE POLICY "Admins can upload artist images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artists' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admins can update artist images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artists' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admins can delete artist images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artists' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);