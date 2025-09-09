-- Corrigir evento FINAL DRAG RACE adicionando organizador primeiro
-- Vamos adicionar a Workroom como organizador para este evento
DO $$
DECLARE
    v_event_id UUID := 'b395a531-11c7-4fc8-a54e-935fc78cacc5';
    v_workroom_id UUID;
BEGIN
    -- Buscar ou criar organizador Workroom
    SELECT id INTO v_workroom_id FROM organizers WHERE name ILIKE '%workroom%' LIMIT 1;
    
    -- Se não encontrou, criar o organizador
    IF v_workroom_id IS NULL THEN
        INSERT INTO organizers (name, contact_email, site, instagram, city, state, country)
        VALUES ('Workroom', 'contato@workroombar.com', 'https://workroombar.com', 'https://www.instagram.com/workroombar/', 'Porto Alegre', 'RS', 'Brasil')
        RETURNING id INTO v_workroom_id;
    END IF;
    
    -- Atualizar o evento para ter organizador
    UPDATE events 
    SET organizer_id = v_workroom_id
    WHERE id = v_event_id;
    
    RAISE NOTICE 'Evento FINAL DRAG RACE atualizado com organizador: %', v_workroom_id;
END $$;