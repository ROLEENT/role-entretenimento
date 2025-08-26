-- Adicionar alguns eventos de exemplo para teste
INSERT INTO public.events (
  title, description, date_start, date_end, city, state, 
  price_min, price_max, image_url, external_url, status
) VALUES 
(
  'Festival de Verão Porto Alegre 2025',
  'O maior festival de música do Sul do Brasil com artistas nacionais e internacionais',
  '2025-02-15 20:00:00-03',
  '2025-02-16 03:00:00-03',
  'Porto Alegre',
  'RS',
  150.00,
  300.00,
  '/assets/porto-alegre-events.jpg',
  'https://festivalveraopoa.com.br',
  'active'
),
(
  'Feira de Artesanato Vila Madalena',
  'Feira com produtos artesanais e apresentações musicais todos os domingos',
  '2025-01-28 10:00:00-03',
  '2025-01-28 18:00:00-03',
  'São Paulo',
  'SP',
  0.00,
  0.00,
  '/assets/sao-paulo-events.jpg',
  NULL,
  'active'
),
(
  'Show Skank - Turnê Despedida',
  'Última turnê da banda Skank pelos principais palcos do Brasil',
  '2025-02-20 21:00:00-03',
  '2025-02-20 23:30:00-03',
  'Curitiba',
  'PR',
  120.00,
  250.00,
  '/assets/curitiba-events.jpg',
  'https://skank.com.br',
  'active'
),
(
  'Oktoberfest Blumenau 2025',
  'A maior festa alemã do Brasil com cerveja, música e tradição',
  '2025-10-15 18:00:00-03',
  '2025-10-31 23:00:00-03',
  'Florianópolis',
  'SC',
  80.00,
  200.00,
  '/assets/florianopolis-events.jpg',
  'https://oktoberfest.com.br',
  'active'
);