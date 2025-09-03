-- Create artist categories table
CREATE TABLE public.artist_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create venue categories table  
CREATE TABLE public.venue_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add category_id to artists table
ALTER TABLE public.artists 
ADD COLUMN category_id uuid REFERENCES public.artist_categories(id);

-- Add category_id to venues table
ALTER TABLE public.venues 
ADD COLUMN category_id uuid REFERENCES public.venue_categories(id);

-- Add category_name to entity_profiles
ALTER TABLE public.entity_profiles 
ADD COLUMN category_name text;

-- Enable RLS on category tables
ALTER TABLE public.artist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for artist_categories
CREATE POLICY "Anyone can view active artist categories" 
ON public.artist_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage artist categories" 
ON public.artist_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
));

-- RLS policies for venue_categories  
CREATE POLICY "Anyone can view active venue categories" 
ON public.venue_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage venue categories" 
ON public.venue_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
));

-- Insert artist categories
INSERT INTO public.artist_categories (name, slug, description) VALUES
('Cantor', 'cantor', 'Artista vocal solo'),
('Cantora', 'cantora', 'Artista vocal solo'),
('MC', 'mc', 'Mestre de cerimônias'),
('DJ', 'dj', 'Disc jockey'),
('Produtor musical', 'produtor-musical', 'Produtor de música'),
('Instrumentista', 'instrumentista', 'Músico instrumentista'),
('Banda', 'banda', 'Grupo musical'),
('Dupla', 'dupla', 'Duo musical'),
('Duo', 'duo', 'Duo artístico'),
('Grupo musical', 'grupo-musical', 'Conjunto musical'),
('Solista', 'solista', 'Artista solo'),
('Ator', 'ator', 'Artista de teatro/cinema'),
('Atriz', 'atriz', 'Artista de teatro/cinema'),
('Companhia de teatro', 'companhia-de-teatro', 'Grupo teatral'),
('Performer', 'performer', 'Artista performático'),
('Drag queen', 'drag-queen', 'Artista drag'),
('Drag king', 'drag-king', 'Artista drag'),
('Transformista', 'transformista', 'Artista transformista'),
('Dançarino', 'dancarino', 'Artista de dança'),
('Companhia de dança', 'companhia-de-danca', 'Grupo de dança'),
('Artista de circo', 'artista-de-circo', 'Palhaço, malabarista, trapezista'),
('Poeta', 'poeta', 'Artista da palavra'),
('Slammer', 'slammer', 'Poeta de poesia falada'),
('Comediante', 'comediante', 'Humorista stand-up'),
('Coletivo artístico', 'coletivo-artistico', 'Grupo artístico'),
('Interdisciplinar', 'interdisciplinar', 'Arte híbrida');

-- Insert venue categories
INSERT INTO public.venue_categories (name, slug, description) VALUES
('Bar', 'bar', 'Estabelecimento de bebidas'),
('Pub', 'pub', 'Bar estilo inglês'),
('Club', 'club', 'Casa noturna'),
('Boate', 'boate', 'Casa de dança'),
('Casa noturna', 'casa-noturna', 'Estabelecimento noturno'),
('Lounge', 'lounge', 'Bar sofisticado'),
('Karaokê', 'karaoke', 'Bar com karaokê'),
('Teatro', 'teatro', 'Casa de espetáculos teatrais'),
('Cinema', 'cinema', 'Sala de cinema'),
('Circo', 'circo', 'Espaço circense'),
('Auditório', 'auditorio', 'Sala de apresentações'),
('Sala de concerto', 'sala-de-concerto', 'Espaço para shows'),
('Casa de show', 'casa-de-show', 'Venue para apresentações'),
('Espaço cultural', 'espaco-cultural', 'Centro cultural'),
('Centro comunitário', 'centro-comunitario', 'Espaço comunitário'),
('Restaurante', 'restaurante', 'Estabelecimento gastronômico'),
('Café cultural', 'cafe-cultural', 'Café com programação cultural'),
('Praça de alimentação', 'praca-de-alimentacao', 'Área de alimentação'),
('Feira gastronômica', 'feira-gastronomica', 'Mercado de comida'),
('Arena', 'arena', 'Grande arena esportiva'),
('Estádio', 'estadio', 'Estádio esportivo'),
('Centro de convenções', 'centro-de-convencoes', 'Espaço para eventos'),
('Espaço ao ar livre', 'espaco-ao-ar-livre', 'Praça, parque, praia');

-- Update sync functions to include category_name
CREATE OR REPLACE FUNCTION public.sync_artist_to_entity_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if entity_profile already exists for this artist
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'artista') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.stage_name,
            bio = NEW.bio_short,
            bio_short = NEW.bio_short,
            city = COALESCE(NEW.city, 'São Paulo'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.booking_email,
            contact_phone = NEW.booking_whatsapp,
            avatar_url = NEW.profile_image_url,
            cover_url = NEW.cover_image_url,
            tags = NEW.tags,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'spotify', NEW.spotify_url,
                'soundcloud', NEW.soundcloud_url,
                'youtube', NEW.youtube_url,
                'beatport', NEW.beatport_url,
                'website', NEW.website_url
            ),
            category_name = (SELECT name FROM artist_categories WHERE id = NEW.category_id),
            updated_at = NOW()
        WHERE source_id = NEW.id AND type = 'artista';
    ELSE
        -- Create new entity_profile
        INSERT INTO entity_profiles (
            source_id,
            type,
            name,
            handle,
            bio,
            bio_short,
            city,
            state,
            country,
            contact_email,
            contact_phone,
            avatar_url,
            cover_url,
            tags,
            links,
            visibility,
            category_name,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'artista',
            NEW.stage_name,
            COALESCE(NEW.slug, lower(replace(NEW.stage_name, ' ', '-'))),
            NEW.bio_short,
            NEW.bio_short,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.booking_email,
            NEW.booking_whatsapp,
            NEW.profile_image_url,
            NEW.cover_image_url,
            NEW.tags,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'spotify', NEW.spotify_url,
                'soundcloud', NEW.soundcloud_url,
                'youtube', NEW.youtube_url,
                'beatport', NEW.beatport_url,
                'website', NEW.website_url
            ),
            'public',
            (SELECT name FROM artist_categories WHERE id = NEW.category_id),
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create sync function for venues
CREATE OR REPLACE FUNCTION public.sync_venue_to_entity_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if entity_profile already exists for this venue
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'local') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.name,
            bio = NEW.description,
            bio_short = NEW.description,
            city = COALESCE(NEW.city, 'São Paulo'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.contact_email,
            contact_phone = NEW.contact_phone,
            avatar_url = NEW.logo_url,
            cover_url = NEW.cover_url,
            tags = NEW.tags,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website
            ),
            category_name = (SELECT name FROM venue_categories WHERE id = NEW.category_id),
            updated_at = NOW()
        WHERE source_id = NEW.id AND type = 'local';
    ELSE
        -- Create new entity_profile
        INSERT INTO entity_profiles (
            source_id,
            type,
            name,
            handle,
            bio,
            bio_short,
            city,
            state,
            country,
            contact_email,
            contact_phone,
            avatar_url,
            cover_url,
            tags,
            links,
            visibility,
            category_name,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'local',
            NEW.name,
            COALESCE(NEW.slug, lower(replace(NEW.name, ' ', '-'))),
            NEW.description,
            NEW.description,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.contact_email,
            NEW.contact_phone,
            NEW.logo_url,
            NEW.cover_url,
            NEW.tags,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website
            ),
            'public',
            (SELECT name FROM venue_categories WHERE id = NEW.category_id),
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;