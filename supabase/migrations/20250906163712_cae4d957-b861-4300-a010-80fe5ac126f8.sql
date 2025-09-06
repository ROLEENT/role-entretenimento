-- Create some example agenda items (events) for better data
INSERT INTO public.agenda_itens (
  title, 
  slug, 
  subtitle,
  summary,
  city,
  location_name,
  starts_at,
  end_at,
  status,
  visibility_type,
  price_min,
  price_max,
  currency,
  ticket_url,
  created_at,
  updated_at
)
SELECT 
  'Festival de Música Eletrônica SP',
  'festival-musica-eletronica-sp-' || TO_CHAR(NOW(), 'YYYY-MM-DD'),
  'Uma noite de beats e energia',
  'O maior festival de música eletrônica da cidade com os melhores DJs nacionais e internacionais.',
  'São Paulo',
  'Complexo Arena SP',
  NOW() + INTERVAL '15 days',
  NOW() + INTERVAL '15 days' + INTERVAL '8 hours',
  'published'::agenda_status,
  'curadoria'::agenda_visibility,
  50.00,
  120.00,
  'BRL',
  'https://example.com/tickets/festival-sp',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM agenda_itens WHERE title LIKE '%Festival de Música Eletrônica SP%');

INSERT INTO public.agenda_itens (
  title, 
  slug, 
  subtitle,
  summary,
  city,
  location_name,
  starts_at,
  end_at,
  status,
  visibility_type,
  price_min,
  price_max,
  currency,
  ticket_url,
  created_at,
  updated_at
)
SELECT 
  'Show de Rock Alternativo POA',
  'show-rock-alternativo-poa-' || TO_CHAR(NOW(), 'YYYY-MM-DD'),
  'Bandas emergentes da cena gaúcha',
  'Uma noite com o melhor do rock alternativo de Porto Alegre e região metropolitana.',
  'Porto Alegre',
  'Auditório Araújo Vianna',
  NOW() + INTERVAL '8 days',
  NOW() + INTERVAL '8 days' + INTERVAL '4 hours',
  'published'::agenda_status,
  'curadoria'::agenda_visibility,
  25.00,
  80.00,
  'BRL',
  'https://example.com/tickets/rock-poa',
  NOW(),
  NOW()
WHERE (SELECT COUNT(*) FROM agenda_itens WHERE status = 'published') < 2;

INSERT INTO public.agenda_itens (
  title, 
  slug, 
  subtitle,
  summary,
  city,
  location_name,
  starts_at,
  end_at,
  status,
  visibility_type,
  price_min,
  price_max,
  currency,
  created_at,
  updated_at
)
SELECT 
  'Roda de Samba Tradicional RJ',
  'roda-samba-tradicional-rj-' || TO_CHAR(NOW(), 'YYYY-MM-DD'),
  'Cultura e tradição carioca',
  'Roda de samba com grandes nomes da música popular brasileira no coração do Rio.',
  'Rio de Janeiro',
  'Casa da Cultura de Santa Teresa',
  NOW() + INTERVAL '12 days',
  NOW() + INTERVAL '12 days' + INTERVAL '6 hours',
  'published'::agenda_status,
  'curadoria'::agenda_visibility,
  0.00,
  30.00,
  'BRL',
  NOW(),
  NOW()
WHERE (SELECT COUNT(*) FROM agenda_itens WHERE status = 'published') < 3;