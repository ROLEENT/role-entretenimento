-- Adicionar Hate Moss ao primeiro slot do evento Hate Moss + Resp3x
-- Primeiro, verificar se não existe e adicionar
INSERT INTO public.event_lineup_slot_artists (slot_id, artist_id, artist_name, position, role)
SELECT 
  els.id,
  'de32b0c5-c228-4610-8185-4c0887a73853'::uuid,
  'Hate Moss',
  0,
  'performer'
FROM public.event_lineup_slots els
WHERE els.event_id = 'afc6a9b5-61ca-4e4f-a76a-28692ca7f475'::uuid
  AND els.slot_name = 'Hate Moss'
  AND NOT EXISTS (
    SELECT 1 FROM public.event_lineup_slot_artists 
    WHERE slot_id = els.id AND artist_id = 'de32b0c5-c228-4610-8185-4c0887a73853'::uuid
  );