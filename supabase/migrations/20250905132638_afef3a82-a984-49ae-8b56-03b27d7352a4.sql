-- COMPLETE CORRECTION PLAN IMPLEMENTATION (Fixed with state values)

-- 1. Add future test events with proper dates including required state field
INSERT INTO events (
  title,
  city,
  state,
  date_start,
  date_end,
  status,
  highlight_type,
  is_sponsored,
  image_url,
  slug,
  subtitle,
  summary,
  price_min,
  price_max,
  currency,
  genres
) VALUES 
-- Porto Alegre events (future dates)
(
  'Festival de Música Eletrônica POA 2025',
  'Porto Alegre',
  'RS',
  '2025-09-10T21:00:00Z',
  '2025-09-11T06:00:00Z',
  'published',
  'vitrine',
  true,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  'festival-musica-eletronica-poa-2025',
  'A maior festa eletrônica do Sul',
  'Uma noite épica com os melhores DJs nacionais e internacionais em Porto Alegre.',
  80.00,
  150.00,
  'BRL',
  ARRAY['Música Eletrônica', 'Festival', 'Techno']
),
(
  'Show de Rock Nacional - POA',
  'Porto Alegre',
  'RS',
  '2025-09-12T20:00:00Z',
  '2025-09-12T23:30:00Z',
  'published',
  'curatorial',
  false,
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
  'show-rock-nacional-poa',
  'O melhor do rock brasileiro',
  'Uma noite especial celebrando o rock nacional com bandas locais e regionais.',
  25.00,
  50.00,
  'BRL',
  ARRAY['Rock', 'Nacional', 'Live Music']
),
(
  'Balada Sertaneja - Beco do Espetinho',
  'Porto Alegre',
  'RS',
  '2025-09-13T22:00:00Z',
  '2025-09-14T04:00:00Z',
  'published',
  'curatorial',
  false,
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
  'balada-sertaneja-beco-poa',
  'Sertanejo universitário em POA',
  'A melhor música sertaneja com os sucessos que todo mundo canta.',
  20.00,
  40.00,
  'BRL',
  ARRAY['Sertanejo', 'Universitário', 'Balada']
),
(
  'Teatro Musical - Casa de Cultura',
  'Porto Alegre',
  'RS',
  '2025-09-15T19:00:00Z',
  '2025-09-15T21:30:00Z',
  'published',
  'curatorial',
  false,
  'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800',
  'teatro-musical-casa-cultura-poa',
  'Espetáculo baseado em clássicos gaúchos',
  'Um espetáculo que celebra a cultura musical do Rio Grande do Sul.',
  15.00,
  30.00,
  'BRL',
  ARRAY['Teatro', 'Musical', 'Cultura Gaúcha']
),

-- São Paulo events
(
  'Festa Junina Moderna - SP',
  'São Paulo',
  'SP',
  '2025-09-14T18:00:00Z',
  '2025-09-15T02:00:00Z',
  'published',
  'vitrine',
  true,
  'https://images.unsplash.com/photo-1540229413465-8e1b7b0f8a8c?w=800',
  'festa-junina-moderna-sp',
  'Tradição com modernidade',
  'Uma festa junina com toque contemporâneo no coração de São Paulo.',
  35.00,
  70.00,
  'BRL',
  ARRAY['Festa Junina', 'Cultural', 'Tradicional']
),
(
  'Show de MPB - Teatro Municipal SP',
  'São Paulo',
  'SP',
  '2025-09-16T20:00:00Z',
  '2025-09-16T22:30:00Z',
  'published',
  'curatorial',
  false,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  'show-mpb-teatro-municipal-sp',
  'Grandes sucessos da MPB',
  'Uma homenagem aos clássicos da música popular brasileira.',
  45.00,
  90.00,
  'BRL',
  ARRAY['MPB', 'Clássicos', 'Teatro']
),

-- Rio de Janeiro events
(
  'Samba no Pé - Lapa',
  'Rio de Janeiro',
  'RJ',
  '2025-09-13T21:00:00Z',
  '2025-09-14T03:00:00Z',
  'published',
  'curatorial',
  false,
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
  'samba-no-pe-lapa-rj',
  'Autêntico samba carioca',
  'Uma noite de puro samba na tradicional Lapa carioca.',
  20.00,
  35.00,
  'BRL',
  ARRAY['Samba', 'Tradicional', 'Carioca']
),

-- Florianópolis events
(
  'Beach Party Electronic - Floripa',
  'Florianópolis',
  'SC',
  '2025-09-14T16:00:00Z',
  '2025-09-15T00:00:00Z',
  'published',
  'vitrine',
  true,
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800',
  'beach-party-electronic-floripa',
  'Música eletrônica na praia',
  'O pôr do sol mais incrível com a melhor música eletrônica.',
  60.00,
  120.00,
  'BRL',
  ARRAY['Música Eletrônica', 'Beach Party', 'Pôr do Sol']
),

-- Curitiba events
(
  'Jazz no Parque - Curitiba',
  'Curitiba',
  'PR',
  '2025-09-15T17:00:00Z',
  '2025-09-15T21:00:00Z',
  'published',
  'curatorial',
  false,
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
  'jazz-no-parque-curitiba',
  'Jazz ao ar livre',
  'Uma tarde de jazz relaxante nos parques de Curitiba.',
  0.00,
  0.00,
  'BRL',
  ARRAY['Jazz', 'Ao Ar Livre', 'Gratuito']
);

-- Update existing events to have future dates if they exist
UPDATE events 
SET date_start = '2025-09-11T20:00:00Z',
    date_end = '2025-09-12T02:00:00Z'
WHERE slug = 'festival-musica-eletronica-porto-alegre';

UPDATE events 
SET date_start = '2025-09-12T19:30:00Z',
    date_end = '2025-09-12T23:00:00Z'
WHERE slug = 'show-rock-nacional-sao-paulo';

UPDATE events 
SET date_start = '2025-09-10T20:00:00Z',
    date_end = '2025-09-10T22:30:00Z'
WHERE slug = 'teatro-musical-rio-janeiro';