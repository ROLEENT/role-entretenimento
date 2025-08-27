-- Create organizers table
CREATE TABLE public.organizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('organizador', 'produtora', 'coletivo', 'selo')),
  city TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_whatsapp TEXT NOT NULL,
  instagram TEXT NOT NULL,
  logo_url TEXT,
  bio_short TEXT,
  bio_long TEXT,
  website_url TEXT,
  portfolio_url TEXT,
  cover_image_url TEXT,
  cities_active TEXT[] DEFAULT '{}',
  genres TEXT[] DEFAULT '{}',
  responsible_name TEXT,
  responsible_role TEXT,
  booking_whatsapp TEXT,
  booking_email TEXT,
  internal_notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  priority INTEGER DEFAULT 0,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create artists table
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_name TEXT NOT NULL UNIQUE,
  artist_type TEXT NOT NULL CHECK (artist_type IN ('banda', 'dj', 'solo', 'drag')),
  city TEXT NOT NULL,
  instagram TEXT NOT NULL,
  booking_email TEXT NOT NULL,
  booking_whatsapp TEXT NOT NULL,
  bio_short TEXT NOT NULL,
  bio_long TEXT,
  profile_image_url TEXT NOT NULL,
  cover_image_url TEXT,
  real_name TEXT,
  pronouns TEXT,
  website_url TEXT,
  spotify_url TEXT,
  soundcloud_url TEXT,
  youtube_url TEXT,
  beatport_url TEXT,
  audius_url TEXT,
  presskit_url TEXT,
  show_format TEXT,
  tech_audio TEXT,
  tech_light TEXT,
  tech_stage TEXT,
  tech_rider_url TEXT,
  set_time_minutes INTEGER,
  team_size INTEGER,
  fee_range TEXT,
  home_city TEXT,
  cities_active TEXT[] DEFAULT '{}',
  availability_days TEXT[] DEFAULT '{}',
  accommodation_notes TEXT,
  image_rights_authorized BOOLEAN DEFAULT false,
  image_credits TEXT,
  responsible_name TEXT,
  responsible_role TEXT,
  internal_notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  priority INTEGER DEFAULT 0,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create artist_genres junction table
CREATE TABLE public.artist_genres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  genre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_organizers junction table
CREATE TABLE public.event_organizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_artists junction table
CREATE TABLE public.event_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  slot_order INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active organizers" ON public.organizers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view active artists" ON public.artists
  FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view artist genres" ON public.artist_genres
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view event organizers" ON public.event_organizers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view event artists" ON public.event_artists
  FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_organizers_updated_at
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_organizers_updated_at();

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('organizers', 'organizers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('artists', 'artists', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true);

-- Storage policies for organizers
CREATE POLICY "Anyone can view organizer images" ON storage.objects
  FOR SELECT USING (bucket_id = 'organizers');

CREATE POLICY "Anyone can view artist images" ON storage.objects
  FOR SELECT USING (bucket_id = 'artists');

CREATE POLICY "Anyone can view event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

-- Admin functions
CREATE OR REPLACE FUNCTION public.admin_get_organizers(p_admin_email text, p_search text DEFAULT NULL)
RETURNS TABLE(
  id uuid, name text, type text, city text, contact_email text, 
  contact_whatsapp text, instagram text, logo_url text, bio_short text,
  status text, slug text, created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  RETURN QUERY
  SELECT 
    o.id, o.name, o.type, o.city, o.contact_email, o.contact_whatsapp,
    o.instagram, o.logo_url, o.bio_short, o.status, o.slug, o.created_at, o.updated_at
  FROM public.organizers o
  WHERE (p_search IS NULL OR o.name ILIKE '%' || p_search || '%')
  ORDER BY o.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_artists(p_admin_email text, p_search text DEFAULT NULL, p_type text DEFAULT NULL)
RETURNS TABLE(
  id uuid, stage_name text, artist_type text, city text, booking_email text,
  booking_whatsapp text, instagram text, profile_image_url text, bio_short text,
  status text, slug text, created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  RETURN QUERY
  SELECT 
    a.id, a.stage_name, a.artist_type, a.city, a.booking_email, a.booking_whatsapp,
    a.instagram, a.profile_image_url, a.bio_short, a.status, a.slug, a.created_at, a.updated_at
  FROM public.artists a
  WHERE 
    (p_search IS NULL OR a.stage_name ILIKE '%' || p_search || '%') AND
    (p_type IS NULL OR a.artist_type = p_type)
  ORDER BY a.created_at DESC;
END;
$$;