-- Insert venues individually to avoid conflicts
INSERT INTO public.venues (name, address, city, state, lat, lng)
SELECT 'Allianz Parque', 'Av. Francisco Matarazzo, 1705 - Água Branca', 'São Paulo', 'SP', -23.5275, -46.6911
WHERE NOT EXISTS (SELECT 1 FROM public.venues WHERE name = 'Allianz Parque');

INSERT INTO public.venues (name, address, city, state, lat, lng)
SELECT 'Maracanã', 'Av. Pres. Castelo Branco, Portão 2 - Maracanã', 'Rio de Janeiro', 'RJ', -22.9122, -43.2302
WHERE NOT EXISTS (SELECT 1 FROM public.venues WHERE name = 'Maracanã');

INSERT INTO public.venues (name, address, city, state, lat, lng)
SELECT 'Circo Voador', 'Rua dos Arcos, s/n - Lapa', 'Rio de Janeiro', 'RJ', -22.9132, -43.1776
WHERE NOT EXISTS (SELECT 1 FROM public.venues WHERE name = 'Circo Voador');

INSERT INTO public.venues (name, address, city, state, lat, lng)
SELECT 'Audio', 'Av. Francisco Matarazzo, 694 - Barra Funda', 'São Paulo', 'SP', -23.5264, -46.6631
WHERE NOT EXISTS (SELECT 1 FROM public.venues WHERE name = 'Audio');

-- Insert categories individually
INSERT INTO public.categories (name, slug, description, color)
SELECT 'Shows', 'shows', 'Shows de música ao vivo', '#E11D48'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Shows');

INSERT INTO public.categories (name, slug, description, color)
SELECT 'Festas', 'festas', 'Festas e baladas', '#7C3AED'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Festas');

-- Insert sample events
INSERT INTO public.events (title, description, date_start, date_end, city, state, price_min, price_max, image_url, venue_id, status)
SELECT 
  'Coldplay Music of the Spheres Tour',
  'Show da turnê mundial do Coldplay com efeitos visuais únicos',
  '2024-09-15 20:00:00+00'::timestamptz,
  '2024-09-15 23:00:00+00'::timestamptz,
  'São Paulo',
  'SP',
  150.00,
  800.00,
  '/assets/hero-banner.jpg',
  v.id,
  'active'
FROM public.venues v
WHERE v.name = 'Allianz Parque'
AND NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Coldplay Music of the Spheres Tour');

INSERT INTO public.events (title, description, date_start, date_end, city, state, price_min, price_max, image_url, venue_id, status)
SELECT 
  'Rock in Rio 2024',
  'O maior festival de música do mundo com artistas internacionais',
  '2024-09-20 14:00:00+00'::timestamptz,
  '2024-09-22 02:00:00+00'::timestamptz,
  'Rio de Janeiro',
  'RJ',
  280.00,
  650.00,
  '/assets/rio-events.jpg',
  v.id,
  'active'
FROM public.venues v
WHERE v.name = 'Maracanã'
AND NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Rock in Rio 2024');