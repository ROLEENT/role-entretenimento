-- Função para sincronizar entity_profiles quando artists é alterado
CREATE OR REPLACE FUNCTION sync_artist_to_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Deletar do entity_profiles quando artist é deletado
    DELETE FROM public.entity_profiles 
    WHERE source_id = OLD.id AND type = 'artista';
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    -- Criar no entity_profiles quando artist é criado
    INSERT INTO public.entity_profiles (
      type, source_id, name, handle, bio, location, 
      profile_image_url, cover_image_url, website_url, 
      instagram_url, contact_email, visibility, created_at, updated_at
    ) VALUES (
      'artista', NEW.id, COALESCE(NEW.stage_name, NEW.real_name, 'Unnamed Artist'), 
      NEW.slug, NEW.bio_short, NEW.city, NEW.profile_image_url, 
      NEW.cover_image_url, NEW.website_url, NEW.instagram, NEW.booking_email,
      CASE WHEN NEW.status = 'active' THEN 'public' ELSE 'draft' END,
      NEW.created_at, NEW.updated_at
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Atualizar entity_profiles quando artist é atualizado
    UPDATE public.entity_profiles SET
      name = COALESCE(NEW.stage_name, NEW.real_name, 'Unnamed Artist'),
      handle = NEW.slug,
      bio = NEW.bio_short,
      location = NEW.city,
      profile_image_url = NEW.profile_image_url,
      cover_image_url = NEW.cover_image_url,
      website_url = NEW.website_url,
      instagram_url = NEW.instagram,
      contact_email = NEW.booking_email,
      visibility = CASE WHEN NEW.status = 'active' THEN 'public' ELSE 'draft' END,
      updated_at = NEW.updated_at
    WHERE source_id = NEW.id AND type = 'artista';
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para sincronizar entity_profiles quando organizers é alterado
CREATE OR REPLACE FUNCTION sync_organizer_to_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.entity_profiles 
    WHERE source_id = OLD.id AND type = 'organizador';
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.entity_profiles (
      type, source_id, name, handle, bio, location, 
      profile_image_url, cover_image_url, website_url, 
      instagram_url, contact_email, visibility, created_at, updated_at
    ) VALUES (
      'organizador', NEW.id, NEW.name, NEW.slug, NEW.bio, NEW.city, 
      NEW.profile_image_url, NEW.cover_image_url, NEW.site, NEW.instagram, 
      NEW.email, CASE WHEN NEW.status = 'active' THEN 'public' ELSE 'draft' END,
      NEW.created_at, NEW.updated_at
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.entity_profiles SET
      name = NEW.name,
      handle = NEW.slug,
      bio = NEW.bio,
      location = NEW.city,
      profile_image_url = NEW.profile_image_url,
      cover_image_url = NEW.cover_image_url,
      website_url = NEW.site,
      instagram_url = NEW.instagram,
      contact_email = NEW.email,
      visibility = CASE WHEN NEW.status = 'active' THEN 'public' ELSE 'draft' END,
      updated_at = NEW.updated_at
    WHERE source_id = NEW.id AND type = 'organizador';
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para sincronizar entity_profiles quando venues é alterado
CREATE OR REPLACE FUNCTION sync_venue_to_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.entity_profiles 
    WHERE source_id = OLD.id AND type = 'local';
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.entity_profiles (
      type, source_id, name, handle, bio, location, 
      profile_image_url, cover_image_url, website_url, 
      instagram_url, contact_email, visibility, created_at, updated_at
    ) VALUES (
      'local', NEW.id, NEW.name, NEW.slug, NEW.description, NEW.city, 
      NEW.profile_image_url, NEW.cover_image_url, NEW.website, NEW.instagram, 
      NEW.email, CASE WHEN NEW.status = 'active' THEN 'public' ELSE 'draft' END,
      NEW.created_at, NEW.updated_at
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.entity_profiles SET
      name = NEW.name,
      handle = NEW.slug,
      bio = NEW.description,
      location = NEW.city,
      profile_image_url = NEW.profile_image_url,
      cover_image_url = NEW.cover_image_url,
      website_url = NEW.website,
      instagram_url = NEW.instagram,
      contact_email = NEW.email,
      visibility = CASE WHEN NEW.status = 'active' THEN 'public' ELSE 'draft' END,
      updated_at = NEW.updated_at
    WHERE source_id = NEW.id AND type = 'local';
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar triggers para artists
DROP TRIGGER IF EXISTS sync_artist_trigger ON public.artists;
CREATE TRIGGER sync_artist_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION sync_artist_to_entity_profile();

-- Criar triggers para organizers
DROP TRIGGER IF EXISTS sync_organizer_trigger ON public.organizers;
CREATE TRIGGER sync_organizer_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION sync_organizer_to_entity_profile();

-- Criar triggers para venues
DROP TRIGGER IF EXISTS sync_venue_trigger ON public.venues;
CREATE TRIGGER sync_venue_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION sync_venue_to_entity_profile();