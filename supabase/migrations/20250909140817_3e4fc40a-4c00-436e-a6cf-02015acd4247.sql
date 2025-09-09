-- Corrigir lineup com IDs corretos dos eventos
-- Evento: Hate Moss (Ita) + Resp3x no Janaíno (11/09)
INSERT INTO public.event_lineup_slot_artists (slot_id, artist_id, artist_name, position, role)
SELECT 
  els.id,
  'de32b0c5-c228-4610-8185-4c0887a73853'::uuid,
  'Hate Moss',
  0,
  'performer'
FROM public.event_lineup_slots els
WHERE els.event_id = 'afc6a9b5-61ca-4e4f-a76a-28692ca7f475'::uuid
  AND els.position = 0
ON CONFLICT DO NOTHING;

-- Associar Resp3x ao segundo slot  
INSERT INTO public.event_lineup_slot_artists (slot_id, artist_id, artist_name, position, role)
SELECT 
  els.id,
  '090debc5-c228-4610-8185-4c0887a73853'::uuid,
  'Resp3x',
  0,
  'performer'
FROM public.event_lineup_slots els
WHERE els.event_id = 'afc6a9b5-61ca-4e4f-a76a-28692ca7f475'::uuid
  AND els.position = 1
ON CONFLICT DO NOTHING;

-- Criar lineup completo para PROBLEMÓN #2 (13/09)
-- Primeiro criar um slot principal
INSERT INTO public.event_lineup_slots (
  event_id, 
  slot_name, 
  position, 
  is_headliner
) VALUES (
  '40c87b95-8e91-468a-8772-d6bc9b125961'::uuid,
  'Lineup Principal',
  0,
  true
);

-- Inserir artistas no slot criado para PROBLEMÓN #2
WITH lineup_slot AS (
  SELECT id FROM public.event_lineup_slots 
  WHERE event_id = '40c87b95-8e91-468a-8772-d6bc9b125961'::uuid
  LIMIT 1
)
INSERT INTO public.event_lineup_slot_artists (slot_id, artist_id, artist_name, position, role)
SELECT 
  ls.id,
  artist_data.artist_id,
  artist_data.artist_name,
  artist_data.position,
  'performer'
FROM lineup_slot ls,
(VALUES 
  ('2594b03f-45a7-45b5-8113-a0594ba1718e'::uuid, 'TUPY', 0),
  ('1556331b-3645-495b-94e1-9294c657f884'::uuid, '598', 1),
  ('2f82b52b-bc18-41a0-92a6-5a5236e4e296'::uuid, 'Andrey Pinheiro', 2),
  ('ce98b0ea-1077-4dae-8e3d-e0ee05c93969'::uuid, 'Dane Tone', 3)
) AS artist_data(artist_id, artist_name, position);