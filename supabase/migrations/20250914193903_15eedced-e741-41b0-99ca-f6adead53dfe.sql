-- FASE 2: ESTRUTURA DE BANCO NOVA - Recriar tabelas conforme o brief

-- Backup e recriar tabela artists
DROP TABLE IF EXISTS public.artists CASCADE;
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug CITEXT NOT NULL UNIQUE,
  bio_short TEXT,
  links JSONB DEFAULT '{}',
  photo_url TEXT,
  photo_alt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Backup e recriar tabela organizers  
DROP TABLE IF EXISTS public.organizers CASCADE;
CREATE TABLE public.organizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug CITEXT NOT NULL UNIQUE,
  about TEXT,
  contacts JSONB DEFAULT '{}',
  logo_url TEXT,
  logo_alt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Backup e recriar tabela venues
DROP TABLE IF EXISTS public.venues CASCADE;
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug CITEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT NOT NULL CHECK (city IN ('POA', 'FLN', 'CWB', 'SP', 'RJ')),
  state TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  capacity INTEGER,
  about TEXT,
  cover_url TEXT,
  cover_alt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela magazine_posts (Revista)
DROP TABLE IF EXISTS public.magazine_posts CASCADE;
CREATE TABLE public.magazine_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug CITEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  summary TEXT,
  body_md TEXT,
  cover_url TEXT,
  cover_alt TEXT,
  tags TEXT[] DEFAULT '{}',
  city TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  related_event_id UUID REFERENCES public.events(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela events com estrutura do brief
DROP TABLE IF EXISTS public.events CASCADE;
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug CITEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  city TEXT NOT NULL,
  start_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  end_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  price_from NUMERIC DEFAULT 0 CHECK (price_from >= 0),
  age_rating TEXT CHECK (age_rating IN ('Livre', '16', '18')),
  description TEXT,
  cover_url TEXT,
  cover_alt TEXT,
  lineup_notes TEXT,
  venue_id UUID REFERENCES public.venues(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_event_duration CHECK (end_utc > start_utc + INTERVAL '1 hour')
);

-- Tabelas ponte
DROP TABLE IF EXISTS public.event_artists CASCADE;
CREATE TABLE public.event_artists (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  billing_order INTEGER NOT NULL DEFAULT 0,
  role TEXT,
  is_headliner BOOLEAN DEFAULT false,
  PRIMARY KEY (event_id, artist_id)
);

DROP TABLE IF EXISTS public.event_organizers CASCADE;
CREATE TABLE public.event_organizers (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizer',
  PRIMARY KEY (event_id, organizer_id)
);

-- Opcional: tabela de mídia do evento
DROP TABLE IF EXISTS public.event_media CASCADE;
CREATE TABLE public.event_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('poster', 'video', 'gallery')),
  url TEXT NOT NULL,
  alt TEXT,
  credit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();  
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_magazine_posts_updated_at BEFORE UPDATE ON public.magazine_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes para performance
CREATE INDEX idx_artists_slug ON public.artists(slug);
CREATE INDEX idx_organizers_slug ON public.organizers(slug);
CREATE INDEX idx_venues_slug ON public.venues(slug);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_magazine_posts_slug ON public.magazine_posts(slug);
CREATE INDEX idx_events_start_utc ON public.events(start_utc);
CREATE INDEX idx_events_city ON public.events(city);

-- RLS Policies
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;

-- Policies para leitura pública
CREATE POLICY "Public can view published content" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Public can view published content" ON public.organizers FOR SELECT USING (true);
CREATE POLICY "Public can view published content" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published magazine" ON public.magazine_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view event relations" ON public.event_artists FOR SELECT USING (true);
CREATE POLICY "Public can view event relations" ON public.event_organizers FOR SELECT USING (true);
CREATE POLICY "Public can view event media" ON public.event_media FOR SELECT USING (true);

-- Policies para admin (usando is_admin_user function que já existe)
CREATE POLICY "Admins can manage all" ON public.artists FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can manage all" ON public.organizers FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can manage all" ON public.venues FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can manage all" ON public.events FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can manage all" ON public.magazine_posts FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can manage all" ON public.event_artists FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can manage all" ON public.event_organizers FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can manage all" ON public.event_media FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());