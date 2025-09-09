-- Verificar se o evento FINAL DRAG RACE existe na tabela correta e adicionar organizador
DO $$
DECLARE
    v_event_id UUID := 'b395a531-11c7-4fc8-a54e-935fc78cacc5';
    v_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se evento existe na tabela events
    SELECT EXISTS(SELECT 1 FROM events WHERE id = v_event_id) INTO v_exists;
    
    IF v_exists THEN
        RAISE NOTICE 'Evento FINAL DRAG RACE encontrado na tabela events';
        
        -- Atualizar o organizador_id se estiver null
        UPDATE events 
        SET organizer_id = (
            SELECT id FROM organizers 
            WHERE name ILIKE '%workroom%' 
            LIMIT 1
        )
        WHERE id = v_event_id AND organizer_id IS NULL;
        
        RAISE NOTICE 'Organizador atualizado para o evento FINAL DRAG RACE';
    ELSE
        RAISE NOTICE 'Evento não encontrado na tabela events';
    END IF;
END $$;