-- Atualizar a função sync_organizer_to_entity_profile para acessar corretamente os campos JSON
CREATE OR REPLACE FUNCTION public.sync_organizer_to_entity_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.contact_email,
            contact_phone = NEW.contact_whatsapp,
            avatar_url = NEW.avatar_url,
            cover_url = NEW.cover_image_url,
            tags = NEW.cities_active,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website,
                'linkedin', COALESCE(NEW.links->>'linkedin', ''),
                'facebook', COALESCE(NEW.links->>'facebook', ''),
                'youtube', COALESCE(NEW.links->>'youtube', ''),
                'tiktok', COALESCE(NEW.links->>'tiktok', ''),
                'twitter', COALESCE(NEW.links->>'twitter', '')
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
            NEW.contact_whatsapp,
            NEW.avatar_url,
            NEW.cover_image_url,
            NEW.cities_active,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website,
                'linkedin', COALESCE(NEW.links->>'linkedin', ''),
                'facebook', COALESCE(NEW.links->>'facebook', ''),
                'youtube', COALESCE(NEW.links->>'youtube', ''),
                'tiktok', COALESCE(NEW.links->>'tiktok', ''),
                'twitter', COALESCE(NEW.links->>'twitter', '')
            ),
            'public',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;