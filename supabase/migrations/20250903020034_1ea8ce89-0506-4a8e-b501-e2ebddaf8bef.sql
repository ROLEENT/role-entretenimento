-- Fix venue visibility issues

-- 1. Update existing venues to have 'public' visibility
UPDATE entity_profiles 
SET visibility = 'public' 
WHERE type = 'venue' AND visibility = 'published';

-- 2. Update the profiles_with_stats view to include both 'public' and 'published' profiles
DROP VIEW IF EXISTS profiles_with_stats;

CREATE VIEW profiles_with_stats AS
SELECT 
  ep.*,
  COALESCE(stats.view_count, 0) as view_count,
  COALESCE(stats.favorite_count, 0) as favorite_count
FROM entity_profiles ep
LEFT JOIN (
  SELECT 
    profile_id,
    COUNT(*) FILTER (WHERE action = 'view') as view_count,
    COUNT(*) FILTER (WHERE action = 'favorite') as favorite_count
  FROM profile_interactions 
  GROUP BY profile_id
) stats ON ep.id = stats.profile_id
WHERE ep.visibility IN ('public', 'published');

-- 3. Update the sync function to save venues with 'public' visibility
CREATE OR REPLACE FUNCTION public.sync_venue_to_entity_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
            avatar_url = NEW.logo_url,
            cover_url = NEW.cover_url,
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
            avatar_url,
            cover_url,
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
            NEW.logo_url,
            NEW.cover_url,
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