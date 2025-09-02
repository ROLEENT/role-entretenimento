-- Fix the sync_artist_to_entity_profile function that's trying to access non-existent 'name' field
-- The artists table only has 'stage_name', not 'name'

CREATE OR REPLACE FUNCTION public.sync_artist_to_entity_profile()
RETURNS TRIGGER AS $$
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
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';