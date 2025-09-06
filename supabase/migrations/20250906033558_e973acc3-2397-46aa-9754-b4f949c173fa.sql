-- Atualizar eventos de teste para status 'draft' para removê-los do site público
UPDATE public.events 
SET status = 'draft', updated_at = NOW()
WHERE title IN (
  'Festival de Música Eletrônica POA 2025',
  'Show de Rock Nacional - POA',
  'Samba no Pé - Lapa',
  'Balada Sertaneja - Beco do Espetinho',
  'Beach Party Electronic - Floripa',
  'Festa Junina Moderna - SP',
  'Jazz no Parque - Curitiba',
  'Teatro Musical - Casa de Cultura',
  'Show de MPB - Teatro Municipal SP',
  'Festival Eletrônico Premium',
  'Hate Moss (Ita) & Vulto no Caos'
) 
AND status = 'published';

-- Verificar quantos registros foram afetados
SELECT 
  COUNT(*) as eventos_atualizados,
  'Eventos de teste alterados para draft' as descricao
FROM public.events 
WHERE title IN (
  'Festival de Música Eletrônica POA 2025',
  'Show de Rock Nacional - POA',
  'Samba no Pé - Lapa',
  'Balada Sertaneja - Beco do Espetinho',
  'Beach Party Electronic - Floripa',
  'Festa Junina Moderna - SP',
  'Jazz no Parque - Curitiba',
  'Teatro Musical - Casa de Cultura',
  'Show de MPB - Teatro Municipal SP',
  'Festival Eletrônico Premium',
  'Hate Moss (Ita) & Vulto no Caos'
) 
AND status = 'draft';