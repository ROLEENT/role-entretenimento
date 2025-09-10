-- 1. LIMPEZA: Remover registros órfãos em entity_profiles
DELETE FROM public.entity_profiles 
WHERE source_id IS NOT NULL 
AND (
  (type = 'organizador' AND NOT EXISTS (SELECT 1 FROM public.organizers WHERE id = entity_profiles.source_id))
  OR (type = 'artista' AND NOT EXISTS (SELECT 1 FROM public.artists WHERE id = entity_profiles.source_id))
  OR (type = 'venue' AND NOT EXISTS (SELECT 1 FROM public.venues WHERE id = entity_profiles.source_id))
);

-- 2. CORRIGIR: Drop triggers existentes
DROP TRIGGER IF EXISTS sync_organizer_to_entity_profile ON public.organizers;
DROP TRIGGER IF EXISTS sync_artist_to_entity_profile ON public.artists;
DROP TRIGGER IF EXISTS sync_venue_to_entity_profile ON public.venues;

-- 3. CORRIGIR: Drop funções existentes
DROP FUNCTION IF EXISTS public.sync_organizer_entity_profile();
DROP FUNCTION IF EXISTS public.sync_artist_entity_profile();
DROP FUNCTION IF EXISTS public.sync_venue_entity_profile();

-- 4. RECRIAR: Função para sincronizar organizers
CREATE OR REPLACE FUNCTION public.sync_organizer_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.entity_profiles (
      source_id, type, name, slug, bio, image_url, 
      instagram, website, city, active, created_at, updated_at
    )
    VALUES (
      NEW.id, 'organizador', NEW.name, NEW.slug, NEW.bio, NEW.logo_url,
      NEW.instagram, NEW.site, NEW.city, true, NEW.created_at, NEW.updated_at
    )
    ON CONFLICT (source_id, type) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      bio = EXCLUDED.bio,
      image_url = EXCLUDED.image_url,
      instagram = EXCLUDED.instagram,
      website = EXCLUDED.website,
      city = EXCLUDED.city,
      updated_at = EXCLUDED.updated_at;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.entity_profiles 
    WHERE source_id = OLD.id AND type = 'organizador';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 5. RECRIAR: Função para sincronizar artists
CREATE OR REPLACE FUNCTION public.sync_artist_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.entity_profiles (
      source_id, type, name, slug, bio, image_url, 
      instagram, website, city, active, created_at, updated_at
    )
    VALUES (
      NEW.id, 'artista', NEW.stage_name, NEW.slug, NEW.bio_short, NEW.profile_image_url,
      NEW.instagram, NEW.website_url, NEW.city, (NEW.status = 'active'), NEW.created_at, NEW.updated_at
    )
    ON CONFLICT (source_id, type) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      bio = EXCLUDED.bio,
      image_url = EXCLUDED.image_url,
      instagram = EXCLUDED.instagram,
      website = EXCLUDED.website,
      city = EXCLUDED.city,
      active = EXCLUDED.active,
      updated_at = EXCLUDED.updated_at;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.entity_profiles 
    WHERE source_id = OLD.id AND type = 'artista';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 6. RECRIAR: Função para sincronizar venues
CREATE OR REPLACE FUNCTION public.sync_venue_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.entity_profiles (
      source_id, type, name, slug, bio, image_url, 
      instagram, website, city, active, created_at, updated_at
    )
    VALUES (
      NEW.id, 'venue', NEW.name, NEW.slug, NEW.description, NEW.image_url,
      NEW.instagram, NEW.website, NEW.city, true, NEW.created_at, NEW.updated_at
    )
    ON CONFLICT (source_id, type) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      bio = EXCLUDED.bio,
      image_url = EXCLUDED.image_url,
      instagram = EXCLUDED.instagram,
      website = EXCLUDED.website,
      city = EXCLUDED.city,
      updated_at = EXCLUDED.updated_at;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.entity_profiles 
    WHERE source_id = OLD.id AND type = 'venue';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 7. RECRIAR: Triggers atualizados
CREATE TRIGGER sync_organizer_to_entity_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION public.sync_organizer_entity_profile();

CREATE TRIGGER sync_artist_to_entity_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.sync_artist_entity_profile();

CREATE TRIGGER sync_venue_to_entity_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.sync_venue_entity_profile();