-- ETAPA 1: CRIAR TIPOS NECESSÁRIOS E AJUSTAR ESTRUTURA DA TABELA PROFILES

-- Criar tipos ENUM se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_type') THEN
        CREATE TYPE profile_type AS ENUM ('artista', 'local', 'organizador');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_visibility') THEN
        CREATE TYPE profile_visibility AS ENUM ('public', 'draft', 'private');
    END IF;
END $$;

-- Adicionar colunas se não existirem
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS handle text UNIQUE,
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS type profile_type DEFAULT 'artista',
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS bio_short text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS visibility profile_visibility DEFAULT 'public';

-- Migrar dados de entity_profiles para profiles apenas se não existirem
INSERT INTO profiles (
  user_id, handle, name, type, city, state, country, 
  bio_short, bio, avatar_url, cover_url, tags, verified,
  links, contact_email, contact_phone, visibility,
  created_at, updated_at
)
SELECT 
  id as user_id, handle, name, 
  CASE 
    WHEN type = 'artist' THEN 'artista'::profile_type
    WHEN type = 'venue' THEN 'local'::profile_type  
    WHEN type = 'organizer' THEN 'organizador'::profile_type
    ELSE 'artista'::profile_type
  END as type,
  city, state, country,
  bio_short, bio, avatar_url, cover_url, tags, verified,
  links, contact_email, contact_phone,
  CASE 
    WHEN visibility = 'public' THEN 'public'::profile_visibility
    WHEN visibility = 'draft' THEN 'draft'::profile_visibility
    WHEN visibility = 'private' THEN 'private'::profile_visibility
    ELSE 'public'::profile_visibility
  END as visibility,
  created_at, updated_at
FROM entity_profiles
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.handle = entity_profiles.handle);

-- EXPANDIR DADOS DE EXEMPLO
UPDATE profiles SET
  bio = CASE handle
    WHEN 'joaomusico' THEN 'João Silva é um guitarrista e compositor brasileiro com mais de 15 anos de experiência. Especializado em rock alternativo e música brasileira, já se apresentou em diversos festivais pelo país e lançou 3 álbuns independentes. Seu estilo único mistura influências do rock nacional com elementos da MPB contemporânea.'
    WHEN 'mariapop' THEN 'Maria Santos é uma cantora e compositora de pop brasileiro que conquistou o cenário musical independente com suas melodias cativantes e letras profundas. Com 2 EPs lançados e mais de 50k seguidores nas redes sociais, ela representa a nova geração da música pop nacional.'
    WHEN 'cultbar' THEN 'O Cult Bar é um dos principais pontos de encontro da cena musical alternativa da cidade. Com capacidade para 200 pessoas, o espaço oferece uma programação diversificada que vai do rock ao jazz, sempre priorizando artistas locais e emergentes.'
    WHEN 'studioz' THEN 'O Studio Z é um espaço cultural multifuncional que combina estúdio de gravação, sala de ensaio e casa de shows. Equipado com tecnologia de ponta e acústica profissional, é o lugar ideal para artistas que buscam qualidade e criatividade.'
    WHEN 'eventospro' THEN 'A Eventos Pro é uma produtora especializada em festivais de música e eventos culturais. Com mais de 10 anos de experiência, já organizou mais de 100 eventos, conectando artistas e públicos através de experiências musicais únicas e memoráveis.'
    ELSE bio
  END,
  bio_short = CASE handle
    WHEN 'joaomusico' THEN 'Guitarrista e compositor de rock alternativo com 15 anos de experiência'
    WHEN 'mariapop' THEN 'Cantora de pop brasileiro, 2 EPs lançados, 50k+ seguidores'
    WHEN 'cultbar' THEN 'Casa de shows alternativa, cap. 200 pessoas, foco em artistas locais'
    WHEN 'studioz' THEN 'Estúdio multifuncional com tecnologia de ponta e acústica profissional'
    WHEN 'eventospro' THEN 'Produtora de festivais musicais, 10+ anos, 100+ eventos realizados'
    ELSE bio_short
  END,
  tags = CASE handle
    WHEN 'joaomusico' THEN ARRAY['rock', 'alternativo', 'compositor', 'guitarrista', 'mpb', 'festival']
    WHEN 'mariapop' THEN ARRAY['pop', 'brasileiro', 'cantora', 'compositora', 'independente', 'streaming']
    WHEN 'cultbar' THEN ARRAY['casa-de-shows', 'rock', 'jazz', 'alternativo', 'artistas-locais', 'drinks']
    WHEN 'studioz' THEN ARRAY['estudio', 'gravacao', 'ensaio', 'acustica', 'tecnologia', 'producao']
    WHEN 'eventospro' THEN ARRAY['producao', 'festivais', 'eventos', 'organizacao', 'logistica', 'cultural']
    ELSE tags
  END,
  links = CASE handle
    WHEN 'joaomusico' THEN '[
      {"type": "spotify", "url": "https://open.spotify.com/artist/joaomusico"},
      {"type": "instagram", "url": "https://instagram.com/joaomusico"},
      {"type": "youtube", "url": "https://youtube.com/joaomusico"},
      {"type": "website", "url": "https://joaomusico.com.br"}
    ]'::jsonb
    WHEN 'mariapop' THEN '[
      {"type": "spotify", "url": "https://open.spotify.com/artist/mariapop"},
      {"type": "instagram", "url": "https://instagram.com/mariapop"},
      {"type": "tiktok", "url": "https://tiktok.com/@mariapop"},
      {"type": "youtube", "url": "https://youtube.com/mariapop"}
    ]'::jsonb
    WHEN 'cultbar' THEN '[
      {"type": "instagram", "url": "https://instagram.com/cultbar"},
      {"type": "facebook", "url": "https://facebook.com/cultbar"},
      {"type": "website", "url": "https://cultbar.com.br"}
    ]'::jsonb
    WHEN 'studioz' THEN '[
      {"type": "instagram", "url": "https://instagram.com/studioz"},
      {"type": "website", "url": "https://studioz.com.br"},
      {"type": "whatsapp", "url": "https://wa.me/5511999999999"}
    ]'::jsonb
    WHEN 'eventospro' THEN '[
      {"type": "instagram", "url": "https://instagram.com/eventospro"},
      {"type": "linkedin", "url": "https://linkedin.com/company/eventospro"},
      {"type": "website", "url": "https://eventospro.com.br"}
    ]'::jsonb
    ELSE links
  END
WHERE handle IN ('joaomusico', 'mariapop', 'cultbar', 'studioz', 'eventospro');

-- Criar alguns seguidores de exemplo se não existirem
INSERT INTO followers (follower_id, following_id, created_at)
SELECT 
  user_1.user_id as follower_id,
  user_2.user_id as following_id,
  now() - interval '30 days' * random() as created_at
FROM (
  SELECT user_id FROM profiles WHERE handle IN ('joaomusico', 'mariapop', 'cultbar') AND user_id IS NOT NULL LIMIT 3
) user_1
CROSS JOIN (
  SELECT user_id FROM profiles WHERE handle IN ('joaomusico', 'mariapop', 'cultbar', 'studioz', 'eventospro') AND user_id IS NOT NULL LIMIT 5
) user_2
WHERE user_1.user_id != user_2.user_id
AND NOT EXISTS (
  SELECT 1 FROM followers 
  WHERE follower_id = user_1.user_id AND following_id = user_2.user_id
)
LIMIT 8;