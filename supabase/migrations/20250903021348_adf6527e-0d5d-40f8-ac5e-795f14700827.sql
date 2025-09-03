-- Add logo fields to venues table for profile picture support

ALTER TABLE public.venues 
ADD COLUMN logo_url text,
ADD COLUMN logo_alt text;

-- Update the sync function to map logo_url to avatar_url
CREATE OR REPLACE FUNCTION public.sync_venue_to_entity_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Check if entity_profile already exists for this venue
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'venue') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.name,
            handle = COALESCE(NEW.slug, lower(replace(NEW.name, ' ', '-'))),
            bio = NEW.about,
            bio_short = NEW.about,
            city = COALESCE(NEW.city, 'São Paulo'),
            state = COALESCE(NEW.state, 'SP'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.email,
            contact_phone = NEW.phone,
            avatar_url = NEW.logo_url,  -- Map logo_url to avatar_url for profile picture
            cover_url = NEW.cover_url,   -- Keep cover_url as cover image
            tags = CASE 
                WHEN NEW.tags IS NOT NULL AND NEW.tags != '' THEN string_to_array(NEW.tags, ',')
                ELSE '{}'::text[]
            END,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website,
                'whatsapp', NEW.whatsapp
            ),
            visibility = 'public',  -- Always set to public for venues
            updated_at = NOW()
        WHERE source_id = NEW.id AND type = 'venue';
    ELSE
        -- Create new entity_profile with public visibility
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
            avatar_url,  -- Map logo_url to avatar_url for profile picture
            cover_url,   -- Keep cover_url as cover image
            tags,
            links,
            visibility,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'venue',
            NEW.name,
            COALESCE(NEW.slug, lower(replace(NEW.name, ' ', '-'))),
            NEW.about,
            NEW.about,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.email,
            NEW.phone,
            NEW.logo_url,  -- Map logo_url to avatar_url for profile picture
            NEW.cover_url, -- Keep cover_url as cover image
            CASE 
                WHEN NEW.tags IS NOT NULL AND NEW.tags != '' THEN string_to_array(NEW.tags, ',')
                ELSE '{}'::text[]
            END,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website,
                'whatsapp', NEW.whatsapp
            ),
            'public',  -- Set to public visibility
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;