-- Add missing columns to organizers table
ALTER TABLE public.organizers 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS cover_alt TEXT,
ADD COLUMN IF NOT EXISTS logo_alt TEXT;

-- Add missing name column to artist_types table
ALTER TABLE public.artist_types 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed Type';

-- Update existing artist_types records to have proper names
UPDATE public.artist_types 
SET name = 'Artist Type ' || id::text 
WHERE name = 'Unnamed Type';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizers_bio ON public.organizers(bio);
CREATE INDEX IF NOT EXISTS idx_organizers_cover_url ON public.organizers(cover_url);
CREATE INDEX IF NOT EXISTS idx_artist_types_name ON public.artist_types(name);

-- Create trigger to sync organizers to entity_profiles
CREATE OR REPLACE FUNCTION public.sync_organizer_to_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if entity_profile already exists for this organizer
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'organizador') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.name,
            bio = NEW.bio,
            city = COALESCE(NEW.city, 'São Paulo'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.contact_email,
            contact_phone = NEW.contact_whatsapp,
            avatar_url = NEW.logo_url,
            cover_url = NEW.cover_url,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.site
            ),
            updated_at = NOW()
        WHERE source_id = NEW.id AND type = 'organizador';
    ELSE
        -- Create new entity_profile
        INSERT INTO entity_profiles (
            source_id,
            type,
            name,
            handle,
            bio,
            city,
            state,
            country,
            contact_email,
            contact_phone,
            avatar_url,
            cover_url,
            links,
            visibility,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'organizador',
            NEW.name,
            COALESCE(NEW.slug, lower(replace(NEW.name, ' ', '-'))),
            NEW.bio,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.contact_email,
            NEW.contact_whatsapp,
            NEW.logo_url,
            NEW.cover_url,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.site
            ),
            'public',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for organizers
DROP TRIGGER IF EXISTS sync_organizer_trigger ON public.organizers;
CREATE TRIGGER sync_organizer_trigger
    AFTER INSERT OR UPDATE ON public.organizers
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_organizer_to_entity_profile();