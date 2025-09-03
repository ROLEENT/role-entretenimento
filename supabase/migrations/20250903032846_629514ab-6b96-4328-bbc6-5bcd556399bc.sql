-- Fix sync_organizer_to_entity_profile function to use avatar_url instead of logo_url
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
            bio = NEW.bio,
            bio_short = NEW.bio,
            city = COALESCE(NEW.city, 'São Paulo'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.contact_email,
            contact_phone = NEW.phone,
            avatar_url = NEW.avatar_url,
            cover_url = NEW.cover_url,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.site,
                'linkedin', NEW.linkedin,
                'youtube', NEW.youtube,
                'tiktok', NEW.tiktok,
                'x_twitter', NEW.x_twitter
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
            NEW.bio,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.contact_email,
            NEW.phone,
            NEW.avatar_url,
            NEW.cover_url,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.site,
                'linkedin', NEW.linkedin,
                'youtube', NEW.youtube,
                'tiktok', NEW.tiktok,
                'x_twitter', NEW.x_twitter
            ),
            'public',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;