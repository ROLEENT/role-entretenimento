-- Fix sync_venue_to_entity_profile function to use correct field names for venue images
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
            bio = NEW.about,
            bio_short = NEW.about,
            city = COALESCE(NEW.city, 'São Paulo'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.email,
            contact_phone = NEW.phone,
            avatar_url = NEW.logo_url,
            cover_url = NEW.cover_url,
            tags = NEW.tags,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website,
                'whatsapp', NEW.whatsapp
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
            NEW.about,
            NEW.about,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.email,
            NEW.phone,
            NEW.logo_url,
            NEW.cover_url,
            NEW.tags,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website,
                'whatsapp', NEW.whatsapp
            ),
            'public',
            (SELECT name FROM venue_categories WHERE id = NEW.category_id),
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$