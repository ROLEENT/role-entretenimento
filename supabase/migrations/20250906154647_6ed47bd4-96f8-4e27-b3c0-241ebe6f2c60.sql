-- Inserir alguns artistas de exemplo para testar o sistema
INSERT INTO public.artists (
  stage_name, 
  artist_type, 
  city, 
  instagram, 
  booking_email, 
  booking_whatsapp, 
  bio_short, 
  profile_image_url, 
  slug, 
  status,
  created_at,
  updated_at
) VALUES 
(
  'DJ Silva', 
  'DJ', 
  'São Paulo', 
  '@djsilva', 
  'booking@djsilva.com', 
  '11999999999', 
  'DJ experiente com foco em house music', 
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 
  'dj-silva', 
  'active',
  NOW(),
  NOW()
),
(
  'Banda Eletrônica', 
  'Banda', 
  'Rio de Janeiro', 
  '@bandaeletronica', 
  'contato@bandaeletronica.com', 
  '21888888888', 
  'Banda de música eletrônica inovadora', 
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 
  'banda-eletronica', 
  'active',
  NOW(),
  NOW()
),
(
  'MC Freestyle', 
  'MC', 
  'Belo Horizonte', 
  '@mcfreestyle', 
  'shows@mcfreestyle.com', 
  '31777777777', 
  'MC especialista em freestyle e improviso', 
  'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400', 
  'mc-freestyle', 
  'active',
  NOW(),
  NOW()
),
(
  'Duo Acústico', 
  'Dupla', 
  'Curitiba', 
  '@duoacustico', 
  'agenda@duoacustico.com', 
  '41666666666', 
  'Dupla especializada em música acústica', 
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', 
  'duo-acustico', 
  'active',
  NOW(),
  NOW()
),
(
  'Produtora Musical X', 
  'Produtor', 
  'Salvador', 
  '@produtoramusicalx', 
  'contato@produtoramusicalx.com', 
  '71555555555', 
  'Produtora focada em novos talentos da música eletrônica', 
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400', 
  'produtora-musical-x', 
  'active',
  NOW(),
  NOW()
);

-- Verificar se os artistas foram inseridos e sincronizados
SELECT COUNT(*) as artists_inserted FROM public.artists;
SELECT COUNT(*) as profiles_synced FROM public.entity_profiles WHERE type = 'artista';