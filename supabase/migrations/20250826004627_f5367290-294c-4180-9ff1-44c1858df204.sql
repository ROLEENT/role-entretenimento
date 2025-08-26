-- Popular tabela partners com dados realistas de casas noturnas e espaços culturais brasileiros
INSERT INTO public.partners (
  name, 
  location, 
  contact_email, 
  website, 
  instagram, 
  image_url, 
  featured, 
  rating, 
  capacity, 
  types
) VALUES 
-- Parceiros Featured (destaque)
(
  'Opinião Pública', 
  'Porto Alegre, RS', 
  'contato@opiniaopublica.com.br',
  'https://opiniaopublica.com.br',
  '@opiniaopublica',
  '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png',
  true,
  4.8,
  '500 pessoas',
  ARRAY['Casa Noturna', 'Shows', 'Eletrônica', 'Indie']
),
(
  'Workroom', 
  'São Paulo, SP', 
  'info@workroom.com.br',
  'https://workroom.com.br',
  '@workroomsp',
  '/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png',
  true,
  4.7,
  '300 pessoas',
  ARRAY['Casa Noturna', 'Techno', 'House', 'Underground']
),
(
  'GREZZ', 
  'Porto Alegre, RS', 
  'contato@grezz.com.br',
  'https://grezz.com.br',
  '@grezzpoa',
  '/assets/hero-banner.jpg',
  true,
  4.6,
  '400 pessoas',
  ARRAY['Casa Noturna', 'Rock', 'Metal', 'Alternativo']
),

-- Parceiros Regulares
(
  'Club Noir', 
  'Rio de Janeiro, RJ', 
  'eventos@clubnoir.com.br',
  'https://clubnoir.com.br',
  '@clubnoirrj',
  '/assets/city-placeholder.jpg',
  false,
  4.5,
  '250 pessoas',
  ARRAY['Casa Noturna', 'Eletrônica', 'Deep House']
),
(
  'Espaço Cultural Vila Flores', 
  'Porto Alegre, RS', 
  'contato@vilaflores.org',
  'https://vilaflores.org',
  '@vilafloresoficial',
  '/assets/curitiba-events.jpg',
  false,
  4.4,
  '200 pessoas',
  ARRAY['Espaço Cultural', 'Shows', 'Teatro', 'Arte']
),
(
  'Trackers', 
  'Curitiba, PR', 
  'info@trackers.com.br',
  'https://trackers.com.br',
  '@trackersctb',
  '/assets/florianopolis-events.jpg',
  false,
  4.3,
  '350 pessoas',
  ARRAY['Casa Noturna', 'Eletrônica', 'Trance', 'Progressive']
),
(
  'Warung Beach Club', 
  'Florianópolis, SC', 
  'contato@warung.com',
  'https://warung.com',
  '@warungbeachclub',
  '/assets/porto-alegre-events.jpg',
  false,
  4.9,
  '800 pessoas',
  ARRAY['Beach Club', 'Eletrônica', 'House', 'Internacional']
),
(
  'Audio Club', 
  'São Paulo, SP', 
  'eventos@audioclub.com.br',
  'https://audioclub.com.br',
  '@audioclubsp',
  '/assets/sao-paulo-events.jpg',
  false,
  4.2,
  '600 pessoas',
  ARRAY['Casa Noturna', 'Techno', 'House', 'Minimal']
);