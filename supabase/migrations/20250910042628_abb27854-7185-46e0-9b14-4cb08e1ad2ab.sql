-- Fase 2: Correção de Relacionamentos Órfãos (Final)
-- Identificar e corrigir relacionamentos inconsistentes

-- 1. Corrigir venues órfãos e reativar Workroom Bar
UPDATE public.venues 
SET status = 'active', updated_at = NOW()
WHERE name = 'Workroom Bar' AND status = 'inactive';

-- 2. Corrigir entity_profiles órfãos do tipo 'local'
-- Primeiro, tentar encontrar venues correspondentes por nome similar
WITH venue_matches AS (
  SELECT 
    ep.id as profile_id,
    ep.name as profile_name,
    v.id as venue_id,
    v.name as venue_name,
    similarity(ep.name, v.name) as sim_score
  FROM entity_profiles ep
  LEFT JOIN venues v ON v.id = ep.source_id
  WHERE ep.type = 'local' 
    AND v.id IS NULL
    AND ep.name IN ('Janaíno Vegan Bar', 'Uptown Club POA', 'Workroom Bar')
),
best_matches AS (
  SELECT DISTINCT ON (vm.profile_id)
    vm.profile_id,
    vm.profile_name,
    v2.id as best_venue_id,
    v2.name as best_venue_name
  FROM venue_matches vm
  JOIN venues v2 ON similarity(vm.profile_name, v2.name) > 0.6
  ORDER BY vm.profile_id, similarity(vm.profile_name, v2.name) DESC
)
UPDATE entity_profiles 
SET source_id = bm.best_venue_id, updated_at = NOW()
FROM best_matches bm
WHERE entity_profiles.id = bm.profile_id;

-- 3. Remover entity_profiles órfãos que não puderam ser corrigidos
DELETE FROM entity_profiles 
WHERE type = 'local' 
  AND source_id NOT IN (SELECT id FROM venues)
  AND name IN ('Janaíno Vegan Bar', 'Uptown Club POA', 'Workroom Bar');

-- 4. Criar entity_profiles para venues que não têm
INSERT INTO entity_profiles (
  source_id, type, name, handle, bio, bio_short, 
  city, state, country, contact_email, contact_phone,
  links, visibility, created_at, updated_at
)
SELECT DISTINCT
  v.id,
  'local',
  v.name,
  COALESCE(v.slug, 
    lower(
      regexp_replace(
        regexp_replace(trim(v.name), '[^a-zA-Z0-9\s\-_]', '', 'g'),
        '\s+', '-', 'g'
      )
    )
  ) || '-' || extract(epoch from now())::bigint::text,
  v.about,
  left(COALESCE(v.about, ''), 200),
  COALESCE(v.city, 'São Paulo'),
  COALESCE(v.state, 'SP'),
  COALESCE(v.country, 'Brasil'),
  v.email,
  v.phone,
  jsonb_build_object(
    'instagram', v.instagram,
    'website', v.website
  ),
  'public',
  NOW(),
  NOW()
FROM venues v
LEFT JOIN entity_profiles ep ON ep.source_id = v.id AND ep.type = 'local'
WHERE ep.id IS NULL AND v.status = 'active';

-- 5. Criar entity_profiles para artists que não têm
INSERT INTO entity_profiles (
  source_id, type, name, handle, bio, bio_short,
  city, state, country, contact_email, contact_phone,
  avatar_url, cover_url, tags, links, visibility, created_at, updated_at
)
SELECT DISTINCT
  a.id,
  'artista',
  a.stage_name,
  COALESCE(a.slug,
    lower(
      regexp_replace(
        regexp_replace(trim(a.stage_name), '[^a-zA-Z0-9\s\-_]', '', 'g'),
        '\s+', '-', 'g'
      )
    )
  ) || '-' || extract(epoch from now())::bigint::text,
  a.bio_short,
  a.bio_short,
  COALESCE(a.city, 'São Paulo'),
  a.state,
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
  'public',
  NOW(),
  NOW()
FROM artists a
LEFT JOIN entity_profiles ep ON ep.source_id = a.id AND ep.type = 'artista'
WHERE ep.id IS NULL AND a.status = 'active';

-- 6. Criar entity_profiles para organizers que não têm
INSERT INTO entity_profiles (
  source_id, type, name, handle, bio, bio_short,
  city, state, country, contact_email, contact_phone,
  avatar_url, cover_url, links, visibility, created_at, updated_at
)
SELECT DISTINCT
  o.id,
  'organizador',
  o.name,
  COALESCE(o.slug,
    lower(
      regexp_replace(
        regexp_replace(trim(o.name), '[^a-zA-Z0-9\s\-_]', '', 'g'),
        '\s+', '-', 'g'
      )
    )
  ) || '-' || extract(epoch from now())::bigint::text,
  o.bio,
  o.bio,
  COALESCE(o.city, 'São Paulo'),
  COALESCE(o.state, 'SP'),
  COALESCE(o.country, 'Brasil'),
  o.email,
  COALESCE(o.whatsapp, o.phone),
  o.avatar_url,
  o.cover_url,
  COALESCE(o.links, jsonb_build_object(
    'instagram', o.instagram,
    'website', COALESCE(o.site, o.website)
  )),
  'public',
  NOW(),
  NOW()
FROM organizers o
LEFT JOIN entity_profiles ep ON ep.source_id = o.id AND ep.type = 'organizador'
WHERE ep.id IS NULL AND o.status = 'active';

-- 7. Função para auditoria de relacionamentos
CREATE OR REPLACE FUNCTION audit_entity_relationships()
RETURNS TABLE(
  issue_type text,
  table_name text,
  record_id uuid,
  record_name text,
  issue_description text
) AS $$
BEGIN
  -- Venues sem entity_profiles
  RETURN QUERY
  SELECT 
    'missing_entity_profile'::text,
    'venues'::text,
    v.id,
    v.name,
    'Venue ativo sem entity_profile correspondente'::text
  FROM venues v
  LEFT JOIN entity_profiles ep ON ep.source_id = v.id AND ep.type = 'local'
  WHERE v.status = 'active' AND ep.id IS NULL;

  -- Artists sem entity_profiles
  RETURN QUERY
  SELECT 
    'missing_entity_profile'::text,
    'artists'::text,
    a.id,
    a.stage_name,
    'Artist ativo sem entity_profile correspondente'::text
  FROM artists a
  LEFT JOIN entity_profiles ep ON ep.source_id = a.id AND ep.type = 'artista'
  WHERE a.status = 'active' AND ep.id IS NULL;

  -- Organizers sem entity_profiles
  RETURN QUERY
  SELECT 
    'missing_entity_profile'::text,
    'organizers'::text,
    o.id,
    o.name,
    'Organizer ativo sem entity_profile correspondente'::text
  FROM organizers o
  LEFT JOIN entity_profiles ep ON ep.source_id = o.id AND ep.type = 'organizador'
  WHERE o.status = 'active' AND ep.id IS NULL;

  -- Entity_profiles órfãos
  RETURN QUERY
  SELECT 
    'orphaned_entity_profile'::text,
    'entity_profiles'::text,
    ep.id,
    ep.name,
    'Entity_profile sem registro correspondente na tabela de origem'::text
  FROM entity_profiles ep
  LEFT JOIN venues v ON v.id = ep.source_id AND ep.type = 'local'
  LEFT JOIN artists a ON a.id = ep.source_id AND ep.type = 'artista'
  LEFT JOIN organizers o ON o.id = ep.source_id AND ep.type = 'organizador'
  WHERE v.id IS NULL AND a.id IS NULL AND o.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;