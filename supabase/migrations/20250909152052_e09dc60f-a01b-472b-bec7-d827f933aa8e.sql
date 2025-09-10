-- Criar um slot de lineup para o evento PROBLEMÓN #2 e adicionar o TUPY
INSERT INTO event_lineup_slots (event_id, slot_name, position, is_headliner)
VALUES ('40c87b95-8e91-468a-8772-d6bc9b125961', 'Lineup Principal', 1, false)
ON CONFLICT DO NOTHING;

-- Pegar o ID do slot criado e adicionar o TUPY
INSERT INTO event_lineup_slot_artists (slot_id, artist_id, artist_name, position, role)
SELECT 
    els.id,
    '2594b03f-45a7-45b5-8113-a0594ba1718e',
    'TUPY',
    1,
    'performer'
FROM event_lineup_slots els 
WHERE els.event_id = '40c87b95-8e91-468a-8772-d6bc9b125961' 
AND els.slot_name = 'Lineup Principal'
ON CONFLICT DO NOTHING;