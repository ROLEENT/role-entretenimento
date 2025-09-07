-- FASE 1: Publicação Imediata dos Eventos Existentes
-- Alterar status de todos os eventos de 'draft' para 'published'

UPDATE public.events 
SET 
  status = 'published',
  updated_at = NOW()
WHERE status = 'draft';

-- Verificar quantos eventos foram publicados
SELECT 
  COUNT(*) as total_events,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_events,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_events
FROM public.events;