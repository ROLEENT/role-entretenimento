-- Corrigir a função sync_organizer_to_entity_profile que ainda usa unaccent sem fallback
CREATE OR REPLACE FUNCTION public.sync_organizer_to_entity_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    unique_handle text;
    counter integer := 1;
    base_handle text;
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
            links = COALESCE(NEW.links, jsonb_build_object(
                'instagram', NEW.instagram,
                'website', COALESCE(NEW.site, NEW.website)
            )),
            updated_at = NOW()
        WHERE source_id = NEW.id AND type = 'organizador';
    ELSE
        -- Generate unique handle for new profile using client-side slug or fallback
        base_handle := COALESCE(NEW.slug, 
            lower(
                regexp_replace(
                    regexp_replace(
                        trim(NEW.name), 
                        '[^a-zA-Z0-9\s\-_]', '', 'g'
                    ),
                    '\s+', '-', 'g'
                )
            )
        );
        
        -- Remove leading/trailing hyphens
        base_handle := trim(base_handle, '-');
        
        -- Ensure base_handle is not empty
        IF base_handle = '' OR base_handle IS NULL THEN
            base_handle := 'organizador';
        END IF;
        
        unique_handle := base_handle;
        
        -- Check for uniqueness and add counter if needed
        WHILE EXISTS (SELECT 1 FROM entity_profiles WHERE handle = unique_handle) LOOP
            unique_handle := base_handle || '-' || counter::text;
            counter := counter + 1;
            
            -- Prevent infinite loop
            IF counter > 1000 THEN
                unique_handle := base_handle || '-' || extract(epoch from now())::bigint::text;
                EXIT;
            END IF;
        END LOOP;
        
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
            COALESCE(NEW.links, jsonb_build_object(
                'instagram', NEW.instagram,
                'website', COALESCE(NEW.site, NEW.website)
            )),
            'public',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;