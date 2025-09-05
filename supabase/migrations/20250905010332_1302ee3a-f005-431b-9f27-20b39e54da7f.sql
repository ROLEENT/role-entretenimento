-- Fix handle generation in sync_organizer_to_entity_profile function
CREATE OR REPLACE FUNCTION public.sync_organizer_to_entity_profile()
RETURNS TRIGGER AS $$
DECLARE
    unique_handle TEXT;
    base_handle TEXT;
    counter INTEGER := 1;
    timestamp_suffix TEXT;
BEGIN
    -- Check if entity_profile already exists for this organizer
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'organizador') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.name,
            bio = NEW.bio,
            bio_short = NEW.bio,
            city = COALESCE(NEW.city, 'São Paulo'),
            state = COALESCE(NEW.state, 'SP'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.email,
            contact_phone = COALESCE(NEW.whatsapp, NEW.phone),
            avatar_url = NEW.avatar_url,
            cover_url = NEW.cover_url,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', COALESCE(NEW.site, NEW.website)
            ),
            updated_at = NOW()
        WHERE source_id = NEW.id AND type = 'organizador';
    ELSE
        -- Generate unique handle
        base_handle := COALESCE(NEW.slug, lower(
            regexp_replace(
                regexp_replace(
                    unaccent(trim(COALESCE(NEW.name, 'organizador'))), 
                    '[^a-zA-Z0-9\s\-_]', '', 'g'
                ),
                '\s+', '-', 'g'
            )
        ));
        
        -- Ensure base_handle is not empty
        IF base_handle = '' OR base_handle IS NULL THEN
            base_handle := 'organizador';
        END IF;
        
        unique_handle := base_handle;
        
        -- Generate timestamp suffix for uniqueness guarantee
        timestamp_suffix := extract(epoch from now())::bigint::text;
        
        -- Check for uniqueness, with a limit to prevent infinite loops
        WHILE counter <= 100 LOOP
            IF NOT EXISTS (SELECT 1 FROM entity_profiles WHERE handle = unique_handle) THEN
                EXIT; -- Found unique handle
            END IF;
            
            counter := counter + 1;
            unique_handle := base_handle || '-' || counter::text;
        END LOOP;
        
        -- If still not unique after 100 attempts, use timestamp
        IF EXISTS (SELECT 1 FROM entity_profiles WHERE handle = unique_handle) THEN
            unique_handle := base_handle || '-' || timestamp_suffix;
        END IF;
        
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
            unique_handle,
            NEW.bio,
            NEW.bio,
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.email,
            COALESCE(NEW.whatsapp, NEW.phone),
            NEW.avatar_url,
            NEW.cover_url,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', COALESCE(NEW.site, NEW.website)
            ),
            'public',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;