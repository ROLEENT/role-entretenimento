-- Fix sync_organizer_to_entity_profile trigger to remove non-existent tags field
CREATE OR REPLACE FUNCTION public.sync_organizer_to_entity_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Check if entity_profile already exists for this organizer
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'organizador') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.name,
            bio = NEW.bio_short,
            bio_short = NEW.bio_short,
            city = COALESCE(NEW.city, 'São Paulo'),
            state = COALESCE(NEW.state, 'SP'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.contact_email,
            contact_phone = COALESCE(NEW.contact_whatsapp, NEW.whatsapp, NEW.phone),
            avatar_url = NEW.avatar_url,
            cover_url = NEW.cover_url,
            links = COALESCE(NEW.links, jsonb_build_object(
                'instagram', NEW.instagram,
                'website', COALESCE(NEW.site, NEW.website, NEW.site_url)
            )),
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
            bio_short,
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
            NEW.bio_short,
            NEW.bio_short,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.contact_email,
            COALESCE(NEW.contact_whatsapp, NEW.whatsapp, NEW.phone),
            NEW.avatar_url,
            NEW.cover_url,
            COALESCE(NEW.links, jsonb_build_object(
                'instagram', NEW.instagram,
                'website', COALESCE(NEW.site, NEW.website, NEW.site_url)
            )),
            'public',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;