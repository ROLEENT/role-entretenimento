-- Check if BIRRA profile already exists to avoid conflicts
DO $$
BEGIN
  -- Create or update entity profile for BIRRA organizer
  IF NOT EXISTS (SELECT 1 FROM entity_profiles WHERE handle = 'birra' AND type = 'organizador') THEN
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
    );
  END IF;

  -- Create artists profiles for lineup if they don't exist
  IF NOT EXISTS (SELECT 1 FROM entity_profiles WHERE handle = 'hate-moss') THEN
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
    ) VALUES (
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
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM entity_profiles WHERE handle = 'resp3x') THEN
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
    ) VALUES (
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
    );
  END IF;
END $$;