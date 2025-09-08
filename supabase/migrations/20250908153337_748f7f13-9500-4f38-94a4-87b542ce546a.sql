-- Create entity profile for BIRRA organizer if not exists
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
  avatar_url,
  cover_url,
  links,
  visibility,
  created_at,
  updated_at
) VALUES (
  '9f29add4-38d9-4bb0-bffc-1c21a48b9a68',
  'organizador',
  'BIRRA',
  'birra',
  'Coletivo BIRRA promove eventos alternativos e underground em Porto Alegre, focando em artistas emergentes e cena independente.',
  'Coletivo BIRRA - eventos alternativos e underground',
  'Porto Alegre',
  'RS',
  'Brasil',
  'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/organizers/avatars/db338f0a-dffd-439a-98f1-450e2fbf771c/1757337144116-4j2kvcs.jpg',
  'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/organizers/covers/db338f0a-dffd-439a-98f1-450e2fbf771c/1757337147559-0uaubz7.png',
  '{"instagram": "@birrafeia"}',
  'public',
  NOW(),
  NOW()
) ON CONFLICT (source_id, type) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  bio_short = EXCLUDED.bio_short,
  updated_at = NOW();

-- Create structured lineup for the event
INSERT INTO event_lineup_slots (
  event_id,
  slot_name,
  start_time,
  position,
  is_headliner,
  stage
) VALUES 
  (
    (SELECT id FROM events WHERE slug = 'hate-moss-ita-resp3x-no-janaino'),
    'Hate Moss',
    '2025-09-11 22:00:00+00',
    1,
    true,
    'Principal'
  ),
  (
    (SELECT id FROM events WHERE slug = 'hate-moss-ita-resp3x-no-janaino'),
    'Resp3x',
    '2025-09-11 21:00:00+00',
    2,
    false,
    'Principal'
  )
ON CONFLICT DO NOTHING;

-- Create artists profiles for lineup
INSERT INTO entity_profiles (
  type,
  name,
  handle,
  bio_short,
  city,
  state,
  country,
  tags,
  visibility,
  created_at,
  updated_at
) VALUES 
  (
    'artista',
    'Hate Moss',
    'hate-moss',
    'Dupla ítalo-brasileira de eletrônica, post-punk e electroclash',
    'Milano/São Paulo',
    'Internacional',
    'Itália/Brasil',
    ARRAY['post punk', 'electroclash', 'eletrônica', 'experimental'],
    'public',
    NOW(),
    NOW()
  ),
  (
    'artista',
    'Resp3x',
    'resp3x',
    'Projeto indie rock, punk e psicodelia de Curitiba',
    'Curitiba',
    'PR',
    'Brasil',
    ARRAY['indie rock', 'punk', 'psicodelia', 'rock'],
    'public',
    NOW(),
    NOW()
  )
ON CONFLICT (handle) DO UPDATE SET
  name = EXCLUDED.name,
  bio_short = EXCLUDED.bio_short,
  updated_at = NOW();