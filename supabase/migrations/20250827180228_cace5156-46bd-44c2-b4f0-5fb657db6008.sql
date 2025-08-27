-- Create artists table
CREATE TABLE IF NOT EXISTS public.artists (
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
CREATE TABLE IF NOT EXISTS public.artist_genres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  genre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_organizers junction table
CREATE TABLE IF NOT EXISTS public.event_organizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_artists junction table
CREATE TABLE IF NOT EXISTS public.event_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  slot_order INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active artists" ON public.artists
  FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view artist genres" ON public.artist_genres
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view event organizers" ON public.event_organizers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view event artists" ON public.event_artists
  FOR SELECT USING (true);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artists', 'artists', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for artists
CREATE POLICY "Anyone can view artist images" ON storage.objects
  FOR SELECT USING (bucket_id = 'artists');

CREATE POLICY "Anyone can view event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

-- Update artists trigger
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();