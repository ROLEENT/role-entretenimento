-- ETAPA 1: AJUSTAR ESTRUTURA DA TABELA PROFILES
-- A tabela profiles atual tem estrutura básica, vamos adicionar as colunas necessárias

-- Primeiro, verificar se já existe a estrutura completa
DO $$ 
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'handle') THEN
        ALTER TABLE profiles ADD COLUMN handle text UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE profiles ADD COLUMN name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'type') THEN
        ALTER TABLE profiles ADD COLUMN type profile_type DEFAULT 'artista';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
        ALTER TABLE profiles ADD COLUMN city text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'state') THEN
        ALTER TABLE profiles ADD COLUMN state text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ADD COLUMN country text DEFAULT 'BR';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio_short') THEN
        ALTER TABLE profiles ADD COLUMN bio_short text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cover_url') THEN
        ALTER TABLE profiles ADD COLUMN cover_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tags') THEN
        ALTER TABLE profiles ADD COLUMN tags text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified') THEN
        ALTER TABLE profiles ADD COLUMN verified boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'links') THEN
        ALTER TABLE profiles ADD COLUMN links jsonb DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'contact_email') THEN
        ALTER TABLE profiles ADD COLUMN contact_email text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'contact_phone') THEN
        ALTER TABLE profiles ADD COLUMN contact_phone text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'visibility') THEN
        ALTER TABLE profiles ADD COLUMN visibility profile_visibility DEFAULT 'public';
    END IF;
END $$;

-- Agora migrar dados de entity_profiles para profiles
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
ON CONFLICT (handle) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  bio_short = EXCLUDED.bio_short,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  cover_url = EXCLUDED.cover_url,
  tags = EXCLUDED.tags,
  verified = EXCLUDED.verified,
  links = EXCLUDED.links,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  visibility = EXCLUDED.visibility,
  updated_at = now();

-- EXPANDIR DADOS DE EXEMPLO COM CONTEÚDO REALISTA
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

-- Criar seguidores de exemplo
INSERT INTO followers (follower_id, following_id, created_at)
SELECT 
  user_1.user_id as follower_id,
  user_2.user_id as following_id,
  now() - interval '30 days' * random() as created_at
FROM (
  SELECT user_id FROM profiles WHERE handle IN ('joaomusico', 'mariapop', 'cultbar') LIMIT 3
) user_1
CROSS JOIN (
  SELECT user_id FROM profiles WHERE handle IN ('joaomusico', 'mariapop', 'cultbar', 'studioz', 'eventospro') LIMIT 5
) user_2
WHERE user_1.user_id != user_2.user_id
AND NOT EXISTS (
  SELECT 1 FROM followers 
  WHERE follower_id = user_1.user_id AND following_id = user_2.user_id
)
LIMIT 8;