-- Fix the sync_organizer_to_entity_profile trigger function
-- The issue is that it's trying to access NEW.cover_image_url which doesn't exist
-- The correct field name is NEW.cover_url

CREATE OR REPLACE FUNCTION public.sync_organizer_to_entity_profile()
RETURNS TRIGGER AS $$
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
            contact_email = NEW.email,
            contact_phone = NEW.phone,
            avatar_url = NEW.avatar_url,
            cover_url = NEW.cover_url,  -- Fixed: was NEW.cover_image_url
            tags = NEW.tags,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.site
            ),
            category_name = 'Organizador',
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
            category_name,
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
            NEW.email,
            NEW.phone,
            NEW.avatar_url,
            NEW.cover_url,  -- Fixed: was NEW.cover_image_url
            NEW.tags,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.site
            ),
            'public',
            'Organizador',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;