-- ETAPA 1: MIGRAÇÃO CRÍTICA DE DADOS CORRIGIDA
-- Migrar dados de entity_profiles para profiles (usando user_id como PK)
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

-- Migrar dados específicos de artistas
INSERT INTO profile_artist (
  profile_id, genres, instruments, experience_years,
  available_for_hire, booking_rate, performance_radius,
  equipment_owned, preferred_venues, career_highlights,
  influences, upcoming_releases, social_media_followers,
  streaming_platforms, press_coverage, awards,
  collaboration_interests, tour_history
)
SELECT 
  p.user_id,
  COALESCE(ep.genres, '{}'),
  COALESCE(ep.instruments, '{}'),
  ep.experience_years,
  COALESCE(ep.available_for_hire, false),
  ep.booking_rate,
  ep.performance_radius,
  ep.equipment_owned,
  ep.preferred_venues,
  ep.career_highlights,
  ep.influences,
  ep.upcoming_releases,
  ep.social_media_followers,
  ep.streaming_platforms,
  ep.press_coverage,
  ep.awards,
  ep.collaboration_interests,
  ep.tour_history
FROM entity_profiles ep
JOIN profiles p ON p.handle = ep.handle
WHERE ep.type = 'artist'
ON CONFLICT (profile_id) DO UPDATE SET
  genres = EXCLUDED.genres,
  instruments = EXCLUDED.instruments,
  experience_years = EXCLUDED.experience_years,
  available_for_hire = EXCLUDED.available_for_hire,
  booking_rate = EXCLUDED.booking_rate,
  performance_radius = EXCLUDED.performance_radius,
  equipment_owned = EXCLUDED.equipment_owned,
  preferred_venues = EXCLUDED.preferred_venues,
  career_highlights = EXCLUDED.career_highlights,
  influences = EXCLUDED.influences,
  upcoming_releases = EXCLUDED.upcoming_releases,
  social_media_followers = EXCLUDED.social_media_followers,
  streaming_platforms = EXCLUDED.streaming_platforms,
  press_coverage = EXCLUDED.press_coverage,
  awards = EXCLUDED.awards,
  collaboration_interests = EXCLUDED.collaboration_interests,
  tour_history = EXCLUDED.tour_history;

-- Migrar dados específicos de locais
INSERT INTO profile_venue (
  profile_id, capacity, venue_type, amenities, technical_specs,
  accessibility_features, parking_info, public_transport,
  catering_options, rental_rates, availability_calendar,
  booking_requirements, cancellation_policy, insurance_info,
  noise_restrictions, setup_time, breakdown_time,
  preferred_events, gallery_images
)
SELECT 
  p.user_id,
  ep.capacity,
  ep.venue_type,
  COALESCE(ep.amenities, '{}'),
  ep.technical_specs,
  COALESCE(ep.accessibility_features, '{}'),
  ep.parking_info,
  ep.public_transport,
  COALESCE(ep.catering_options, '{}'),
  ep.rental_rates,
  ep.availability_calendar,
  ep.booking_requirements,
  ep.cancellation_policy,
  ep.insurance_info,
  ep.noise_restrictions,
  ep.setup_time,
  ep.breakdown_time,
  COALESCE(ep.preferred_events, '{}'),
  COALESCE(ep.gallery_images, '{}')
FROM entity_profiles ep
JOIN profiles p ON p.handle = ep.handle
WHERE ep.type = 'venue'
ON CONFLICT (profile_id) DO UPDATE SET
  capacity = EXCLUDED.capacity,
  venue_type = EXCLUDED.venue_type,
  amenities = EXCLUDED.amenities,
  technical_specs = EXCLUDED.technical_specs,
  accessibility_features = EXCLUDED.accessibility_features,
  parking_info = EXCLUDED.parking_info,
  public_transport = EXCLUDED.public_transport,
  catering_options = EXCLUDED.catering_options,
  rental_rates = EXCLUDED.rental_rates,
  availability_calendar = EXCLUDED.availability_calendar,
  booking_requirements = EXCLUDED.booking_requirements,
  cancellation_policy = EXCLUDED.cancellation_policy,
  insurance_info = EXCLUDED.insurance_info,
  noise_restrictions = EXCLUDED.noise_restrictions,
  setup_time = EXCLUDED.setup_time,
  breakdown_time = EXCLUDED.breakdown_time,
  preferred_events = EXCLUDED.preferred_events,
  gallery_images = EXCLUDED.gallery_images;

-- Migrar dados específicos de organizadores
INSERT INTO profile_org (
  profile_id, organization_size, event_types, budget_range,
  planning_timeline, preferred_venues, vendor_network,
  past_events, client_testimonials, services_offered,
  geographic_reach, team_members, certifications,
  insurance_coverage, emergency_procedures, sustainability_practices
)
SELECT 
  p.user_id,
  ep.organization_size,
  COALESCE(ep.event_types, '{}'),
  ep.budget_range,
  ep.planning_timeline,
  COALESCE(ep.preferred_venues, '{}'),
  ep.vendor_network,
  COALESCE(ep.past_events, '{}'),
  COALESCE(ep.client_testimonials, '{}'),
  COALESCE(ep.services_offered, '{}'),
  ep.geographic_reach,
  COALESCE(ep.team_members, '{}'),
  COALESCE(ep.certifications, '{}'),
  ep.insurance_coverage,
  ep.emergency_procedures,
  ep.sustainability_practices
FROM entity_profiles ep
JOIN profiles p ON p.handle = ep.handle
WHERE ep.type = 'organizer'
ON CONFLICT (profile_id) DO UPDATE SET
  organization_size = EXCLUDED.organization_size,
  event_types = EXCLUDED.event_types,
  budget_range = EXCLUDED.budget_range,
  planning_timeline = EXCLUDED.planning_timeline,
  preferred_venues = EXCLUDED.preferred_venues,
  vendor_network = EXCLUDED.vendor_network,
  past_events = EXCLUDED.past_events,
  client_testimonials = EXCLUDED.client_testimonials,
  services_offered = EXCLUDED.services_offered,
  geographic_reach = EXCLUDED.geographic_reach,
  team_members = EXCLUDED.team_members,
  certifications = EXCLUDED.certifications,
  insurance_coverage = EXCLUDED.insurance_coverage,
  emergency_procedures = EXCLUDED.emergency_procedures,
  sustainability_practices = EXCLUDED.sustainability_practices;

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
  END;

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

-- Criar algumas atividades de exemplo
INSERT INTO activity_feed (user_id, actor_id, type, object_type, object_id, data, created_at)
SELECT 
  p1.user_id as user_id,
  p2.user_id as actor_id,
  'profile_follow' as type,
  'profile' as object_type,
  p1.user_id as object_id,
  jsonb_build_object('actor_name', p2.name, 'actor_handle', p2.handle) as data,
  now() - interval '7 days' * random() as created_at
FROM profiles p1
CROSS JOIN profiles p2
WHERE p1.user_id != p2.user_id
AND p1.handle IN ('joaomusico', 'mariapop', 'cultbar')
AND p2.handle IN ('mariapop', 'cultbar', 'studioz', 'eventospro')
LIMIT 5;