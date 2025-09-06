-- Enable pgcrypto extension first for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create some simple example agenda items (events) for better data
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
  currency
)
VALUES 
  (
    'Festival de Música Eletrônica SP',
    'festival-musica-eletronica-sp-2025',
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
    'BRL'
  ),
  (
    'Show de Rock Alternativo POA',
    'show-rock-alternativo-poa-2025',
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
    'BRL'
  ),
  (
    'Roda de Samba Tradicional RJ',
    'roda-samba-tradicional-rj-2025',
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
    'BRL'
  )
ON CONFLICT (slug) DO NOTHING;