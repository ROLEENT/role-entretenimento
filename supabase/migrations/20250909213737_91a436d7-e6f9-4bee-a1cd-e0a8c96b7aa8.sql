-- Migração completa para o sistema Events
-- Passo 1: Migrar organizador do PROBLEMÓN #2 para events.organizer_id

-- Atualizar evento PROBLEMÓN #2 com organizador_id baseado no registro em agenda_item_organizers
UPDATE events 
SET organizer_id = (
  SELECT organizer_id 
  FROM agenda_item_organizers 
  WHERE agenda_id = events.id 
  AND main_organizer = true
  LIMIT 1
)
WHERE title = 'PROBLEMÓN #2' AND organizer_id IS NULL;

-- Se não houver main_organizer marcado, pegar o primeiro organizador
UPDATE events 
SET organizer_id = (
  SELECT organizer_id 
  FROM agenda_item_organizers 
  WHERE agenda_id = events.id 
  LIMIT 1
)
WHERE title = 'PROBLEMÓN #2' AND organizer_id IS NULL;

-- Passo 2: Criar foreign key constraint para garantir integridade
ALTER TABLE events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES organizers(id);

-- Passo 3: Limpar tabela de relacionamento antiga para eventos
-- Remover registros de agenda_item_organizers que referenciam eventos (não agenda_itens)
DELETE FROM agenda_item_organizers 
WHERE agenda_id IN (SELECT id FROM events);

-- Passo 4: Verificar resultado da migração
-- Esta query deve mostrar todos os eventos com seus organizadores migrados
SELECT 
  e.id,
  e.title,
  e.slug,
  e.organizer_id,
  o.name as organizer_name
FROM events e
LEFT JOIN organizers o ON e.organizer_id = o.id
WHERE e.status = 'published';