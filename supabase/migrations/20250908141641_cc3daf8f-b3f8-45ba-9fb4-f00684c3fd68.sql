-- Atualizar eventos existentes de draft para published na tabela events
UPDATE public.events 
SET status = 'published' 
WHERE status = 'draft';

-- Verificar se há algum evento com status draft
SELECT COUNT(*) as draft_events FROM public.events WHERE status = 'draft';

-- Verificar eventos publicados
SELECT COUNT(*) as published_events FROM public.events WHERE status = 'published';