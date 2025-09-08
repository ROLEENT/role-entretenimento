-- Atualizar eventos existentes de draft para published
UPDATE public.agenda_itens 
SET status = 'published' 
WHERE status = 'draft';