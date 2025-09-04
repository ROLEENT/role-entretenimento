-- Primeiro, verificar e ajustar o enum highlight_type para incluir todos os valores
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'editorial';
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'showcase'; 
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'sponsored';
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'none';

-- Exemplo de seed para testar o sistema de curadoria
-- Criar evento de exemplo (Hate Moss & Vulto no Caos)

INSERT INTO public.events (
  id,
  title,
  slug,
  city,
  date_start,
  date_end,
  location_name,
  cover_url,
  summary,
  highlight_type,
  is_sponsored,
  price_min,
  price_max,
  currency,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Hate Moss (Ita) & Vulto no Caos',
  'hate-moss-vulto-caos',
  'Porto Alegre',
  '2025-09-04 21:00:00-03'::timestamptz,
  '2025-09-05 03:00:00-03'::timestamptz,
  'Caos',
  'https://cdn.example.com/hate-moss-vulto.jpg',
  'Show raro em POA combinando pós-punk, eletrônica sombria e cena local. Hate Moss traz sua turnê italiana para o Brasil pela primeira vez.',
  'editorial'::highlight_type,
  false,
  60.00,
  80.00,
  'BRL',
  now(),
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  highlight_type = EXCLUDED.highlight_type,
  updated_at = now();

-- Buscar o ID do evento e inserir critérios
DO $$
DECLARE
  event_uuid UUID;
BEGIN
  SELECT id INTO event_uuid FROM public.events WHERE slug = 'hate-moss-vulto-caos';
  
  IF event_uuid IS NOT NULL THEN
    -- Inserir critérios de curadoria
    INSERT INTO public.event_curation_criteria (event_id, key, status, is_primary) VALUES
      (event_uuid, 'relevancia', 'met', true),
      (event_uuid, 'qualidade', 'met', true),
      (event_uuid, 'diversidade', 'partial', false),
      (event_uuid, 'impacto', 'met', true),
      (event_uuid, 'coerencia', 'met', false),
      (event_uuid, 'experiencia', 'met', false),
      (event_uuid, 'tecnica', 'met', false),
      (event_uuid, 'acessibilidade', 'partial', false)
    ON CONFLICT (event_id, key) DO UPDATE SET
      status = EXCLUDED.status,
      is_primary = EXCLUDED.is_primary;
      
    -- Atualizar notas de curadoria
    UPDATE public.events 
    SET curation_notes = 'Show raro em POA. Combina pós punk, eletrônica sombria e cena local. Artista internacional de qualidade com proposta coerente.'
    WHERE id = event_uuid;
  END IF;
END $$;

-- Criar exemplo de vitrine cultural
INSERT INTO public.events (
  id,
  title,
  slug,
  city,
  date_start,
  date_end,
  location_name,
  cover_url,
  summary,
  highlight_type,
  is_sponsored,
  price_min,
  price_max,
  currency,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Festival Eletrônico Premium',
  'festival-eletronico-premium',
  'São Paulo',
  '2025-10-15 20:00:00-03'::timestamptz,
  '2025-10-16 06:00:00-03'::timestamptz,
  'Arena Premium',
  'https://cdn.example.com/festival-premium.jpg',
  'O maior festival de música eletrônica premium do Brasil. Lineup internacional de primeira linha.',
  'sponsored'::highlight_type,
  true,
  180.00,
  350.00,
  'BRL',
  now(),
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  highlight_type = EXCLUDED.highlight_type,
  is_sponsored = EXCLUDED.is_sponsored,
  updated_at = now();