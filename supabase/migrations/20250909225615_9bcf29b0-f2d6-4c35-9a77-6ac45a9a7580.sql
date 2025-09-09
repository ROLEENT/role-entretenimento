-- Corrigir lineup do evento FINAL DRAG RACE BR - remover Tristan Soledade e ajustar posições

-- Remover Tristan Soledade do lineup
DELETE FROM agenda_item_artists 
WHERE agenda_id = 'b395a531-11c7-4fc8-a54e-935fc78cacc5' 
AND artist_id = '7c55ac4c-9989-4de5-a175-928fa872f51b';

-- Atualizar Dylan Summers para posição 0 e headliner
UPDATE agenda_item_artists 
SET position = 0, headliner = true, role = 'headliner'
WHERE agenda_id = 'b395a531-11c7-4fc8-a54e-935fc78cacc5' 
AND artist_id = '10f43aca-e8c5-4913-b0fb-9673bbc229ff';

-- Atualizar Katrina Addams para posição 1
UPDATE agenda_item_artists 
SET position = 1, headliner = false, role = 'support'
WHERE agenda_id = 'b395a531-11c7-4fc8-a54e-935fc78cacc5' 
AND artist_id = 'a0f57ad4-0f91-4f3b-bc45-03018d626c7f';

-- Atualizar o campo artists_names para refletir apenas Dylan e Katrina
UPDATE agenda_itens 
SET artists_names = ARRAY['Dylan Summers', 'Katrina Addams']
WHERE id = 'b395a531-11c7-4fc8-a54e-935fc78cacc5';