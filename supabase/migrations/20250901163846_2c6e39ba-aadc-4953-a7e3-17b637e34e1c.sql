-- Create triggers to synchronize administrative forms with entity_profiles (VENUES CORRECTED)

-- Function to sync artist data to entity_profiles
CREATE OR REPLACE FUNCTION sync_artist_to_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if entity_profile already exists for this artist
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'artista') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = COALESCE(NEW.stage_name, NEW.name),
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
            COALESCE(NEW.stage_name, NEW.name),
            COALESCE(NEW.slug, lower(replace(COALESCE(NEW.stage_name, NEW.name), ' ', '-'))),
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
            CASE WHEN NEW.status = 'active' THEN 'published' ELSE 'draft' END,
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync organizer data to entity_profiles
CREATE OR REPLACE FUNCTION sync_organizer_to_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if entity_profile already exists for this organizer
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'organizador') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.name,
            bio = NEW.bio_short,
            bio_short = NEW.bio_short,
            city = COALESCE(NEW.city, 'São Paulo'),
            country = 'Brasil',
            contact_email = NEW.contact_email,
            contact_phone = NEW.contact_whatsapp,
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
            bio_short,
            city,
            state,
            country,
            contact_email,
            contact_phone,
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
            'SP',
            'Brasil',
            NEW.contact_email,
            NEW.contact_whatsapp,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.site
            ),
            CASE WHEN NEW.status = 'active' THEN 'published' ELSE 'draft' END,
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync venue data to entity_profiles (CORRECTED)
CREATE OR REPLACE FUNCTION sync_venue_to_entity_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if entity_profile already exists for this venue
    IF EXISTS (SELECT 1 FROM entity_profiles WHERE source_id = NEW.id AND type = 'local') THEN
        -- Update existing profile
        UPDATE entity_profiles SET
            name = NEW.name,
            bio = NEW.about,
            bio_short = LEFT(COALESCE(NEW.about, ''), 200),
            city = COALESCE(NEW.city, 'São Paulo'),
            country = COALESCE(NEW.country, 'Brasil'),
            contact_email = NEW.email,
            contact_phone = NEW.phone,
            links = jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website
            ),
            cover_url = NEW.cover_url,
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
            links,
            cover_url,
            visibility,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'local',
            NEW.name,
            COALESCE(NEW.slug, lower(replace(NEW.name, ' ', '-'))),
            NEW.about,
            LEFT(COALESCE(NEW.about, ''), 200),
            COALESCE(NEW.city, 'São Paulo'),
            COALESCE(NEW.state, 'SP'),
            COALESCE(NEW.country, 'Brasil'),
            NEW.email,
            NEW.phone,
            jsonb_build_object(
                'instagram', NEW.instagram,
                'website', NEW.website
            ),
            NEW.cover_url,
            CASE WHEN NEW.status = 'active' THEN 'published' ELSE 'draft' END,
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for artists
DROP TRIGGER IF EXISTS sync_artist_trigger ON artists;
CREATE TRIGGER sync_artist_trigger
    AFTER INSERT OR UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION sync_artist_to_entity_profile();

-- Create triggers for organizers
DROP TRIGGER IF EXISTS sync_organizer_trigger ON organizers;
CREATE TRIGGER sync_organizer_trigger
    AFTER INSERT OR UPDATE ON organizers
    FOR EACH ROW
    EXECUTE FUNCTION sync_organizer_to_entity_profile();

-- Create triggers for venues
DROP TRIGGER IF EXISTS sync_venue_trigger ON venues;
CREATE TRIGGER sync_venue_trigger
    AFTER INSERT OR UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION sync_venue_to_entity_profile();

-- Initial sync of existing data (FINAL VERSION - VENUES CORRECTED)
INSERT INTO entity_profiles (
    source_id, type, name, handle, bio, bio_short, city, state, country,
    contact_email, contact_phone, avatar_url, cover_url,
    tags, links, visibility, created_at, updated_at
)
SELECT 
    a.id,
    'artista',
    COALESCE(a.stage_name, a.name),
    COALESCE(a.slug, lower(replace(COALESCE(a.stage_name, a.name), ' ', '-'))),
    a.bio_short,
    a.bio_short,
    COALESCE(a.city, 'São Paulo'),
    COALESCE(a.state, 'SP'),
    COALESCE(a.country, 'Brasil'),
    a.booking_email,
    a.booking_whatsapp,
    a.profile_image_url,
    a.cover_image_url,
    a.tags,
    jsonb_build_object(
        'instagram', a.instagram,
        'spotify', a.spotify_url,
        'soundcloud', a.soundcloud_url,
        'youtube', a.youtube_url,
        'beatport', a.beatport_url,
        'website', a.website_url
    ),
    CASE WHEN a.status = 'active' THEN 'published' ELSE 'draft' END,
    a.created_at,
    a.updated_at
FROM artists a
WHERE NOT EXISTS (
    SELECT 1 FROM entity_profiles ep 
    WHERE ep.source_id = a.id AND ep.type = 'artista'
);

INSERT INTO entity_profiles (
    source_id, type, name, handle, bio, bio_short, city, state, country,
    contact_email, contact_phone, links, visibility, created_at, updated_at
)
SELECT 
    o.id,
    'organizador',
    o.name,
    COALESCE(o.slug, lower(replace(o.name, ' ', '-'))),
    o.bio_short,
    o.bio_short,
    COALESCE(o.city, 'São Paulo'),
    'SP',
    'Brasil',
    o.contact_email,
    o.contact_whatsapp,
    jsonb_build_object(
        'instagram', o.instagram,
        'website', o.site
    ),
    CASE WHEN o.status = 'active' THEN 'published' ELSE 'draft' END,
    o.created_at,
    o.updated_at
FROM organizers o
WHERE NOT EXISTS (
    SELECT 1 FROM entity_profiles ep 
    WHERE ep.source_id = o.id AND ep.type = 'organizador'
);

INSERT INTO entity_profiles (
    source_id, type, name, handle, bio, bio_short, city, state, country,
    contact_email, contact_phone, links, cover_url, visibility, created_at, updated_at
)
SELECT 
    v.id,
    'local',
    v.name,
    COALESCE(v.slug, lower(replace(v.name, ' ', '-'))),
    v.about,
    LEFT(COALESCE(v.about, ''), 200),
    COALESCE(v.city, 'São Paulo'),
    COALESCE(v.state, 'SP'),
    COALESCE(v.country, 'Brasil'),
    v.email,
    v.phone,
    jsonb_build_object(
        'instagram', v.instagram,
        'website', v.website
    ),
    v.cover_url,
    CASE WHEN v.status = 'active' THEN 'published' ELSE 'draft' END,
    v.created_at,
    v.updated_at
FROM venues v
WHERE NOT EXISTS (
    SELECT 1 FROM entity_profiles ep 
    WHERE ep.source_id = v.id AND ep.type = 'local'
);