-- Criar tabela de artistas
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  artist_type TEXT NOT NULL CHECK (artist_type IN ('banda', 'dj', 'solo', 'drag')),
  city TEXT NOT NULL,
  instagram TEXT NOT NULL,
  booking_email TEXT NOT NULL,
  booking_whatsapp TEXT NOT NULL,
  bio_short TEXT NOT NULL CHECK (length(bio_short) <= 300),
  profile_image_url TEXT NOT NULL,
  bio_long TEXT CHECK (length(bio_long) <= 1500),
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
  set_time_minutes INTEGER CHECK (set_time_minutes > 0),
  team_size INTEGER CHECK (team_size > 0),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view published artists" 
ON public.artists 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage artists" 
ON public.artists 
FOR ALL 
USING (is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email'))
WITH CHECK (is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email'));

-- Criar bucket para artistas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artists', 'artists', true);

-- Políticas para o bucket artists
CREATE POLICY "Anyone can view artist images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artists');

CREATE POLICY "Admins can upload artist images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artists' AND is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email'));

CREATE POLICY "Admins can update artist images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'artists' AND is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email'));

CREATE POLICY "Admins can delete artist images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'artists' AND is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_artist_slug(stage_name_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Criar slug base removendo acentos e caracteres especiais
  base_slug := lower(trim(regexp_replace(
    translate(stage_name_input, 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouu cn'),
    '[^a-z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Verificar se slug já existe e adicionar número se necessário
  WHILE EXISTS (SELECT 1 FROM public.artists WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;