-- Create sample events with real venues (first fix the venues and categories)
INSERT INTO public.venues (name, address, city, state, lat, lng) VALUES
  ('Allianz Parque', 'Av. Francisco Matarazzo, 1705 - Água Branca', 'São Paulo', 'SP', -23.5275, -46.6911),
  ('Maracanã', 'Av. Pres. Castelo Branco, Portão 2 - Maracanã', 'Rio de Janeiro', 'RJ', -22.9122, -43.2302),
  ('Arena da Baixada', 'Rua Buenos Aires, 1260 - Água Verde', 'Curitiba', 'PR', -25.4483, -49.2769),
  ('Beira-Mar Continental', 'Av. Beira Mar Norte - Centro', 'Florianópolis', 'SC', -27.5969, -48.5495),
  ('Opinião', 'Rua José do Patrocínio, 834 - Cidade Baixa', 'Porto Alegre', 'RS', -30.0346, -51.2177),
  ('Teatro Municipal', 'Praça Ramos de Azevedo - República', 'São Paulo', 'SP', -23.5447, -46.6364),
  ('Circo Voador', 'Rua dos Arcos, s/n - Lapa', 'Rio de Janeiro', 'RJ', -22.9132, -43.1776),
  ('Ópera de Arame', 'Rua João Gava, 970 - Abranches', 'Curitiba', 'PR', -25.3973, -49.2379),
  ('P12', 'Av. Epitácio Pessoa, 1484 - Lagoa Rodrigo de Freitas', 'Rio de Janeiro', 'RJ', -22.9711, -43.2098),
  ('Audio', 'Av. Francisco Matarazzo, 694 - Barra Funda', 'São Paulo', 'SP', -23.5264, -46.6631)
ON CONFLICT (name) DO NOTHING;

-- Create categories that don't exist
INSERT INTO public.categories (name, slug, description, color) VALUES
  ('Shows', 'shows', 'Shows de música ao vivo', '#E11D48'),
  ('Festas', 'festas', 'Festas e baladas', '#7C3AED'),
  ('Teatro', 'teatro', 'Peças teatrais e espetáculos', '#DC2626'),
  ('Gastronomia', 'gastronomia', 'Eventos gastronômicos', '#D97706'),
  ('Música Eletrônica', 'eletronica', 'Festas de música eletrônica', '#7C2D12'),
  ('Rock', 'rock', 'Shows de rock e metal', '#991B1B'),
  ('MPB', 'mpb', 'Música Popular Brasileira', '#166534'),
  ('Jazz', 'jazz', 'Shows de jazz e blues', '#1E40AF')
ON CONFLICT (name) DO NOTHING;

-- Get venue IDs and create events
WITH venue_ids AS (
  SELECT id, name FROM public.venues WHERE name IN (
    'Allianz Parque', 'Maracanã', 'Arena da Baixada', 'Beira-Mar Continental', 
    'Opinião', 'Teatro Municipal', 'Circo Voador', 'Ópera de Arame', 'P12', 'Audio'
  )
)
INSERT INTO public.events (title, description, date_start, date_end, city, state, price_min, price_max, image_url, venue_id, status) 
SELECT 
  event_data.title,
  event_data.description,
  event_data.date_start,
  event_data.date_end,
  event_data.city,
  event_data.state,
  event_data.price_min,
  event_data.price_max,
  event_data.image_url,
  v.id,
  'active'
FROM (VALUES
  ('Coldplay Music of the Spheres Tour', 'Show da turnê mundial do Coldplay com efeitos visuais únicos', '2024-09-15 20:00:00+00', '2024-09-15 23:00:00+00', 'São Paulo', 'SP', 150.00, 800.00, '/assets/hero-banner.jpg', 'Allianz Parque'),
  ('Rock in Rio 2024', 'O maior festival de música do mundo com artistas internacionais', '2024-09-20 14:00:00+00', '2024-09-22 02:00:00+00', 'Rio de Janeiro', 'RJ', 280.00, 650.00, '/assets/rio-events.jpg', 'Maracanã'),
  ('Festival de Inverno de Curitiba', 'Festival multicultural com música, teatro e gastronomia', '2024-08-30 18:00:00+00', '2024-09-01 23:00:00+00', 'Curitiba', 'PR', 0.00, 120.00, '/assets/curitiba-events.jpg', 'Ópera de Arame'),
  ('Festa de Ano Novo Floripa', 'Reveillon na praia com shows e queima de fogos', '2024-12-31 22:00:00+00', '2025-01-01 06:00:00+00', 'Florianópolis', 'SC', 80.00, 250.00, '/assets/florianopolis-events.jpg', 'Beira-Mar Continental'),
  ('Opinião Jazz Festival', 'Festival de jazz com artistas nacionais e internacionais', '2024-09-10 19:00:00+00', '2024-09-12 02:00:00+00', 'Porto Alegre', 'RS', 60.00, 180.00, '/assets/porto-alegre-events.jpg', 'Opinião'),
  ('Hamlet - Teatro Municipal', 'Clássico de Shakespeare em nova montagem brasileira', '2024-08-25 20:00:00+00', '2024-08-25 22:30:00+00', 'São Paulo', 'SP', 40.00, 120.00, '/assets/hero-banner.jpg', 'Teatro Municipal'),
  ('Anitta Live Experience', 'Show exclusivo da Anitta com convidados especiais', '2024-09-05 21:00:00+00', '2024-09-05 23:30:00+00', 'Rio de Janeiro', 'RJ', 120.00, 400.00, '/assets/rio-events.jpg', 'Circo Voador'),
  ('Festa Eletrônica Underground', 'Noite de techno com DJs internacionais', '2024-08-31 23:00:00+00', '2024-09-01 08:00:00+00', 'São Paulo', 'SP', 80.00, 150.00, '/assets/sao-paulo-events.jpg', 'Audio'),
  ('After Work P12', 'Happy hour com música e drinks especiais', '2024-08-30 18:00:00+00', '2024-08-30 23:00:00+00', 'Rio de Janeiro', 'RJ', 40.00, 120.00, '/assets/rio-events.jpg', 'P12')
) AS event_data(title, description, date_start, date_end, city, state, price_min, price_max, image_url, venue_name)
JOIN venue_ids v ON v.name = event_data.venue_name;

-- Create partners data  
INSERT INTO public.partners (name, location, image_url, website, instagram, contact_email, types, capacity, rating, featured) VALUES
  ('Allianz Parque', 'São Paulo, SP', '/assets/sao-paulo-events.jpg', 'https://www.allianzparque.com.br', '@allianzparque', 'contato@allianzparque.com.br', ARRAY['Arena', 'Estádio'], '43000', 4.8, true),
  ('Circo Voador', 'Rio de Janeiro, RJ', '/assets/rio-events.jpg', 'https://circovoador.com.br', '@circovoador', 'contato@circovoador.com.br', ARRAY['Casa de Show', 'Teatro'], '1500', 4.7, true),
  ('Opinião', 'Porto Alegre, RS', '/assets/porto-alegre-events.jpg', 'https://opiniao.com.br', '@opiniaopoa', 'contato@opiniao.com.br', ARRAY['Bar', 'Show'], '400', 4.6, false),
  ('Audio', 'São Paulo, SP', '/assets/sao-paulo-events.jpg', 'https://audio.club', '@audioclub', 'contato@audio.club', ARRAY['Clube', 'Eletrônica'], '2000', 4.4, true);