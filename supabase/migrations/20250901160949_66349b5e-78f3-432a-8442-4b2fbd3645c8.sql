-- ETAPA 1: AJUSTAR MIGRAÇÃO PARA LIDAR COM IDs DE USUÁRIOS NÃO EXISTENTES

-- Vamos apenas atualizar os perfis existentes com dados reais e expandir os dados de exemplo
-- sem tentar inserir novos perfis com user_ids que não existem

-- EXPANDIR DADOS DE EXEMPLO PARA PERFIS EXISTENTES
UPDATE profiles SET
  bio = CASE 
    WHEN email LIKE '%joao%' OR handle = 'joaomusico' THEN 'João Silva é um guitarrista e compositor brasileiro com mais de 15 anos de experiência. Especializado em rock alternativo e música brasileira, já se apresentou em diversos festivais pelo país e lançou 3 álbuns independentes. Seu estilo único mistura influências do rock nacional com elementos da MPB contemporânea.'
    WHEN email LIKE '%maria%' OR handle = 'mariapop' THEN 'Maria Santos é uma cantora e compositora de pop brasileiro que conquistou o cenário musical independente com suas melodias cativantes e letras profundas. Com 2 EPs lançados e mais de 50k seguidores nas redes sociais, ela representa a nova geração da música pop nacional.'
    ELSE 'Perfil criado para demonstração do sistema de reivindicação de perfis. Este é um exemplo de bio completa que mostra como o perfil pode ser expandido com informações detalhadas sobre o artista, local ou organizador.'
  END,
  bio_short = CASE 
    WHEN email LIKE '%joao%' OR handle = 'joaomusico' THEN 'Guitarrista e compositor de rock alternativo com 15 anos de experiência'
    WHEN email LIKE '%maria%' OR handle = 'mariapop' THEN 'Cantora de pop brasileiro, 2 EPs lançados, 50k+ seguidores'
    ELSE 'Perfil de demonstração para testes do sistema'
  END,
  name = COALESCE(name, 
    CASE 
      WHEN email LIKE '%joao%' THEN 'João Silva'
      WHEN email LIKE '%maria%' THEN 'Maria Santos'
      ELSE 'Perfil Demo'
    END
  ),
  handle = COALESCE(handle,
    CASE 
      WHEN email LIKE '%joao%' THEN 'joaomusico'
      WHEN email LIKE '%maria%' THEN 'mariapop'
      ELSE LOWER(REGEXP_REPLACE(COALESCE(name, 'demo'), '[^a-zA-Z0-9]', '', 'g'))
    END
  ),
  type = COALESCE(type, 'artista'::profile_type),
  city = COALESCE(city, 'São Paulo'),
  state = COALESCE(state, 'SP'),
  country = COALESCE(country, 'BR'),
  tags = COALESCE(tags, ARRAY['demo', 'teste', 'exemplo']),
  verified = COALESCE(verified, false),
  links = COALESCE(links, '[
    {"type": "instagram", "url": "https://instagram.com/demo"},
    {"type": "website", "url": "https://exemplo.com.br"}
  ]'::jsonb),
  visibility = COALESCE(visibility, 'public'::profile_visibility)
WHERE user_id IS NOT NULL;

-- Criar alguns perfis de exemplo órfãos (sem user_id) para teste de reivindicação
INSERT INTO profiles (
  handle, name, type, city, state, country, 
  bio_short, bio, tags, verified, links, visibility,
  created_at, updated_at
) VALUES
(
  'joaomusico',
  'João Silva',
  'artista',
  'São Paulo',
  'SP',
  'BR',
  'Guitarrista e compositor de rock alternativo com 15 anos de experiência',
  'João Silva é um guitarrista e compositor brasileiro com mais de 15 anos de experiência. Especializado em rock alternativo e música brasileira, já se apresentou em diversos festivais pelo país e lançou 3 álbuns independentes. Seu estilo único mistura influências do rock nacional com elementos da MPB contemporânea.',
  ARRAY['rock', 'alternativo', 'compositor', 'guitarrista', 'mpb', 'festival'],
  false,
  '[
    {"type": "spotify", "url": "https://open.spotify.com/artist/joaomusico"},
    {"type": "instagram", "url": "https://instagram.com/joaomusico"},
    {"type": "youtube", "url": "https://youtube.com/joaomusico"},
    {"type": "website", "url": "https://joaomusico.com.br"}
  ]'::jsonb,
  'public',
  now(),
  now()
),
(
  'mariapop',
  'Maria Santos',
  'artista',
  'Rio de Janeiro',
  'RJ',
  'BR',
  'Cantora de pop brasileiro, 2 EPs lançados, 50k+ seguidores',
  'Maria Santos é uma cantora e compositora de pop brasileiro que conquistou o cenário musical independente com suas melodias cativantes e letras profundas. Com 2 EPs lançados e mais de 50k seguidores nas redes sociais, ela representa a nova geração da música pop nacional.',
  ARRAY['pop', 'brasileiro', 'cantora', 'compositora', 'independente', 'streaming'],
  false,
  '[
    {"type": "spotify", "url": "https://open.spotify.com/artist/mariapop"},
    {"type": "instagram", "url": "https://instagram.com/mariapop"},
    {"type": "tiktok", "url": "https://tiktok.com/@mariapop"},
    {"type": "youtube", "url": "https://youtube.com/mariapop"}
  ]'::jsonb,
  'public',
  now(),
  now()
),
(
  'cultbar',
  'Cult Bar',
  'local',
  'São Paulo',
  'SP',
  'BR',
  'Casa de shows alternativa, cap. 200 pessoas, foco em artistas locais',
  'O Cult Bar é um dos principais pontos de encontro da cena musical alternativa da cidade. Com capacidade para 200 pessoas, o espaço oferece uma programação diversificada que vai do rock ao jazz, sempre priorizando artistas locais e emergentes.',
  ARRAY['casa-de-shows', 'rock', 'jazz', 'alternativo', 'artistas-locais', 'drinks'],
  false,
  '[
    {"type": "instagram", "url": "https://instagram.com/cultbar"},
    {"type": "facebook", "url": "https://facebook.com/cultbar"},
    {"type": "website", "url": "https://cultbar.com.br"}
  ]'::jsonb,
  'public',
  now(),
  now()
),
(
  'studioz',
  'Studio Z',
  'local',
  'Belo Horizonte',
  'MG',
  'BR',
  'Estúdio multifuncional com tecnologia de ponta e acústica profissional',
  'O Studio Z é um espaço cultural multifuncional que combina estúdio de gravação, sala de ensaio e casa de shows. Equipado com tecnologia de ponta e acústica profissional, é o lugar ideal para artistas que buscam qualidade e criatividade.',
  ARRAY['estudio', 'gravacao', 'ensaio', 'acustica', 'tecnologia', 'producao'],
  false,
  '[
    {"type": "instagram", "url": "https://instagram.com/studioz"},
    {"type": "website", "url": "https://studioz.com.br"},
    {"type": "whatsapp", "url": "https://wa.me/5511999999999"}
  ]'::jsonb,
  'public',
  now(),
  now()
),
(
  'eventospro',
  'Eventos Pro',
  'organizador',
  'Porto Alegre',
  'RS',
  'BR',
  'Produtora de festivais musicais, 10+ anos, 100+ eventos realizados',
  'A Eventos Pro é uma produtora especializada em festivais de música e eventos culturais. Com mais de 10 anos de experiência, já organizou mais de 100 eventos, conectando artistas e públicos através de experiências musicais únicas e memoráveis.',
  ARRAY['producao', 'festivais', 'eventos', 'organizacao', 'logistica', 'cultural'],
  false,
  '[
    {"type": "instagram", "url": "https://instagram.com/eventospro"},
    {"type": "linkedin", "url": "https://linkedin.com/company/eventospro"},
    {"type": "website", "url": "https://eventospro.com.br"}
  ]'::jsonb,
  'public',
  now(),
  now()
)
ON CONFLICT (handle) DO NOTHING;