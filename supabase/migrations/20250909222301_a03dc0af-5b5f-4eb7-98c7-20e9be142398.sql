-- Corrigir o evento FINAL DRAG RACE para ter lineup correto
-- Primeiro, verificar se existe algum artista associado
DO $$
DECLARE
    v_event_id UUID := 'b395a531-11c7-4fc8-a54e-935fc78cacc5';
    v_artist_id UUID;
BEGIN
    -- Buscar artistas que possam estar relacionados ao evento por nome
    SELECT id INTO v_artist_id 
    FROM artists 
    WHERE stage_name ILIKE '%Tristan%' OR stage_name ILIKE '%Dylan%' OR stage_name ILIKE '%Katrina%'
    LIMIT 1;
    
    -- Se encontrou artista, associar ao evento
    IF v_artist_id IS NOT NULL THEN
        INSERT INTO agenda_item_artists (agenda_id, artist_id, position, headliner, role)
        VALUES (v_event_id, v_artist_id, 0, true, 'headliner')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Artista % associado ao evento FINAL DRAG RACE', v_artist_id;
    ELSE
        RAISE NOTICE 'Nenhum artista encontrado para associar ao evento';
    END IF;
END $$;