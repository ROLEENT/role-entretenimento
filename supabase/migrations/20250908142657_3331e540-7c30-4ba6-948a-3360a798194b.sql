-- Atualizar o evento "Hate Moss" para incluir o organizer_id correto
UPDATE public.events 
SET organizer_id = '9f29add4-38d9-4bb0-bffc-1c21a48b9a68'
WHERE title = 'Hate Moss (Ita) + Resp3x no Janaíno';

-- Verificar se a atualização foi bem-sucedida
SELECT id, title, organizer_id FROM public.events WHERE title ILIKE '%Hate Moss%';