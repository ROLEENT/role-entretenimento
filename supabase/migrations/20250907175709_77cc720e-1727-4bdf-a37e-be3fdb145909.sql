-- LIMPEZA COMPLETA DOS DADOS FAKE/TESTE
-- Fase 1: Backup de contagem atual
DO $$
DECLARE
    eventos_count integer;
    artistas_count integer;
    organizadores_count integer;
    venues_count integer;
BEGIN
    SELECT COUNT(*) INTO eventos_count FROM public.events;
    SELECT COUNT(*) INTO artistas_count FROM public.artists;
    SELECT COUNT(*) INTO organizadores_count FROM public.organizers;
    SELECT COUNT(*) INTO venues_count FROM public.venues;
    
    RAISE NOTICE 'ANTES DA LIMPEZA:';
    RAISE NOTICE 'Eventos: %', eventos_count;
    RAISE NOTICE 'Artistas: %', artistas_count;
    RAISE NOTICE 'Organizadores: %', organizadores_count;
    RAISE NOTICE 'Venues: %', venues_count;
END $$;

-- Fase 2: Limpar tabelas relacionadas primeiro (evitar FK constraints)
DELETE FROM public.event_lineup_slot_artists;
DELETE FROM public.event_lineup_slots;
DELETE FROM public.event_partners;
DELETE FROM public.event_performances;
DELETE FROM public.event_visual_artists;
DELETE FROM public.event_curation_criteria;
DELETE FROM public.agenda_item_artists;
DELETE FROM public.agenda_item_organizers;
DELETE FROM public.agenda_media;
DELETE FROM public.agenda_occurrences;
DELETE FROM public.agenda_ticket_tiers;
DELETE FROM public.artist_genres;
DELETE FROM public.artist_roles;
DELETE FROM public.artists_artist_types;

-- Fase 3: Deletar dados principais
-- Deletar todos os eventos
DELETE FROM public.events;
DELETE FROM public.agenda_itens;

-- Deletar todos os artistas
DELETE FROM public.artists;

-- Deletar todos os organizadores  
DELETE FROM public.organizers;

-- Deletar todos os venues
DELETE FROM public.venues;

-- Fase 4: Verificação final
DO $$
DECLARE
    eventos_count integer;
    artistas_count integer;
    organizadores_count integer;
    venues_count integer;
BEGIN
    SELECT COUNT(*) INTO eventos_count FROM public.events;
    SELECT COUNT(*) INTO artistas_count FROM public.artists;
    SELECT COUNT(*) INTO organizadores_count FROM public.organizers;
    SELECT COUNT(*) INTO venues_count FROM public.venues;
    
    RAISE NOTICE 'APÓS LIMPEZA:';
    RAISE NOTICE 'Eventos: %', eventos_count;
    RAISE NOTICE 'Artistas: %', artistas_count;
    RAISE NOTICE 'Organizadores: %', organizadores_count;
    RAISE NOTICE 'Venues: %', venues_count;
    
    IF eventos_count = 0 AND artistas_count = 0 AND organizadores_count = 0 AND venues_count = 0 THEN
        RAISE NOTICE 'LIMPEZA COMPLETA REALIZADA COM SUCESSO!';
    ELSE
        RAISE NOTICE 'ATENÇÃO: Ainda existem dados nas tabelas!';
    END IF;
END $$;