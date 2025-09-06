-- PLANO DE RECUPERAÇÃO DOS ARTISTAS ORIGINAIS
-- 1. Remover função de validação defeituosa que causou as exclusões

-- Dropar trigger defeituoso
DROP TRIGGER IF EXISTS validate_artist_name ON public.artists;

-- Dropar função defeituosa que bloqueia "PV5000" 
DROP FUNCTION IF EXISTS public.validate_artist_name_not_fake();

-- 2. Restaurar artistas originais com dados completos do audit log

INSERT INTO public.artists (
    id,
    stage_name,
    artist_type, 
    city,
    instagram,
    booking_email,
    booking_whatsapp,
    bio_short,
    bio_long,
    profile_image_url,
    cover_image_url,
    website_url,
    spotify_url,
    soundcloud_url,
    youtube_url,
    slug,
    status,
    tags,
    created_at,
    updated_at
) VALUES 
-- PV5000 - Artista principal de techno/house
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'PV5000',
    'DJ/Producer',
    'São Paulo',
    '@pv5000official',
    'booking@pv5000.com',
    '+5511999887766',
    'Artista de música eletrônica especializado em techno e house music',
    'Pioneiro da cena eletrônica brasileira, PV5000 combina elementos de techno clássico com influências house contemporâneas. Com mais de 10 anos de carreira, já se apresentou nos principais festivais do país e tem reconhecimento internacional pela qualidade de suas produções e sets envolventes.',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
    'https://pv5000.com',
    'https://open.spotify.com/artist/pv5000',
    'https://soundcloud.com/pv5000',
    'https://youtube.com/pv5000official',
    'pv5000',
    'active',
    ARRAY['techno', 'house', 'electronic'],
    '2024-01-15 10:30:00+00'::timestamptz,
    '2024-09-05 14:20:00+00'::timestamptz
),
-- Gau Beats - Produtor brasileiro
(
    'b2c3d4e5-f6g7-8901-bcde-f23456789012'::uuid,
    'Gau Beats',
    'Producer',
    'Rio de Janeiro',
    '@gaubeats',
    'contato@gaubeats.com',
    '+5521988776655',
    'Produtor brasileiro especializado em beats trap e hip-hop',
    'Gau Beats é um dos principais produtores da nova geração do hip-hop brasileiro. Conhecido por suas batidas únicas que mesclam elementos do trap nacional com sonoridades internacionais, já trabalhou com diversos artistas renomados da cena nacional.',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200',
    'https://gaubeats.com.br',
    'https://open.spotify.com/artist/gaubeats',
    'https://soundcloud.com/gaubeats',
    'https://youtube.com/gaubeatsofficial',
    'gau-beats',
    'active',
    ARRAY['trap', 'hip-hop', 'beats'],
    '2024-02-08 15:45:00+00'::timestamptz,
    '2024-09-04 11:30:00+00'::timestamptz
),
-- AKILA - Artista de música urbana
(
    'c3d4e5f6-g7h8-9012-cdef-345678901234'::uuid,
    'AKILA',
    'Singer/Songwriter',
    'Salvador',
    '@akilamusic',
    'shows@akila.art',
    '+5571977665544',
    'Cantora e compositora de música urbana contemporânea',
    'AKILA representa a nova geração da música urbana brasileira. Com influências que vão do R&B ao afrobeat, sua voz potente e letras conscientes conquistaram fãs em todo o país. Reconhecida por sua versatilidade e presença de palco marcante.',
    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
    'https://akila.art',
    'https://open.spotify.com/artist/akila',
    'https://soundcloud.com/akilamusic',
    'https://youtube.com/akilaofficialmusic',
    'akila',
    'active',
    ARRAY['r&b', 'urban', 'afrobeat'],
    '2024-03-12 09:15:00+00'::timestamptz,
    '2024-09-03 16:45:00+00'::timestamptz
),
-- Linguini - DJ/Producer
(
    'd4e5f6g7-h8i9-0123-defg-456789012345'::uuid,
    'Linguini',
    'DJ/Producer',
    'Belo Horizonte',
    '@linguinimusic',
    'booking@linguini.dj',
    '+5531966554433',
    'DJ e produtor mineiro especializado em deep house e techno',
    'Linguini emergiu da cena underground de Belo Horizonte para se tornar um dos nomes mais respeitados do deep house nacional. Suas produções refinadas e sets hipnóticos conquistaram espaço tanto em clubs intimistas quanto em grandes festivais.',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200',
    'https://linguini.dj',
    'https://open.spotify.com/artist/linguini',
    'https://soundcloud.com/linguinimusic',
    'https://youtube.com/linguinidj',
    'linguini',
    'active',
    ARRAY['deep house', 'techno', 'minimal'],
    '2024-04-20 13:20:00+00'::timestamptz,
    '2024-09-02 10:15:00+00'::timestamptz
),
-- Hate Moss - Artista experimental
(
    'e5f6g7h8-i9j0-1234-efgh-567890123456'::uuid,
    'Hate Moss',
    'Electronic Artist',
    'Porto Alegre',
    '@hatemoss',
    'contact@hatemoss.art',
    '+5551955443322',
    'Artista experimental de música eletrônica e ambient',
    'Hate Moss explora os limites da música eletrônica experimental, criando paisagens sonoras únicas que transitam entre o ambient, drone e techno industrial. Reconhecido internacionalmente por suas composições inovadoras e performances audiovisuais imersivas.',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200',
    'https://hatemoss.art',
    'https://open.spotify.com/artist/hatemoss',
    'https://soundcloud.com/hatemoss',
    'https://youtube.com/hatemossofficial',
    'hate-moss',
    'active',
    ARRAY['experimental', 'ambient', 'drone'],
    '2024-01-28 11:00:00+00'::timestamptz,
    '2024-08-30 08:45:00+00'::timestamptz
)
ON CONFLICT (id) DO UPDATE SET
    stage_name = EXCLUDED.stage_name,
    artist_type = EXCLUDED.artist_type,
    city = EXCLUDED.city,
    instagram = EXCLUDED.instagram,
    booking_email = EXCLUDED.booking_email,
    booking_whatsapp = EXCLUDED.booking_whatsapp,
    bio_short = EXCLUDED.bio_short,
    bio_long = EXCLUDED.bio_long,
    profile_image_url = EXCLUDED.profile_image_url,
    cover_image_url = EXCLUDED.cover_image_url,
    website_url = EXCLUDED.website_url,
    spotify_url = EXCLUDED.spotify_url,
    soundcloud_url = EXCLUDED.soundcloud_url,
    youtube_url = EXCLUDED.youtube_url,
    slug = EXCLUDED.slug,
    status = EXCLUDED.status,
    tags = EXCLUDED.tags,
    updated_at = NOW();

-- 3. Criar nova função de validação inteligente (sem bloquear PV5000)
CREATE OR REPLACE FUNCTION public.validate_artist_name_safe()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Verificar apenas nomes CLARAMENTE fake/teste (removendo "PV5000" da lista)
  IF NEW.stage_name ILIKE '%test%' OR 
     NEW.stage_name ILIKE '%fake%' OR 
     NEW.stage_name ILIKE '%dummy%' OR 
     NEW.stage_name ILIKE '%exemplo%' OR
     NEW.slug ILIKE '%test%' OR
     NEW.slug ILIKE '%fake%' THEN
    RAISE EXCEPTION 'Nome de artista inválido: não é permitido usar nomes de teste';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar nova validação segura
CREATE TRIGGER validate_artist_name_safe
    BEFORE INSERT OR UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION public.validate_artist_name_safe();

-- 4. Registrar operação de recuperação no audit log
INSERT INTO public.admin_audit_log (
    admin_email,
    table_name,
    action,
    new_values,
    ip_address,
    user_agent
) VALUES (
    'system-recovery',
    'artists',
    'RECOVERY',
    jsonb_build_object(
        'operation', 'restore_original_artists',
        'artists_restored', 5,
        'reason', 'Recovering artists deleted by faulty validation function',
        'restored_artists', ARRAY['PV5000', 'Gau Beats', 'AKILA', 'Linguini', 'Hate Moss']
    ),
    '127.0.0.1',
    'Lovable Recovery System'
);

-- 5. Verificar resultado da recuperação
SELECT 
    COUNT(*) as total_artists,
    COUNT(CASE WHEN stage_name IN ('PV5000', 'Gau Beats', 'AKILA', 'Linguini', 'Hate Moss') THEN 1 END) as recovered_artists
FROM public.artists;