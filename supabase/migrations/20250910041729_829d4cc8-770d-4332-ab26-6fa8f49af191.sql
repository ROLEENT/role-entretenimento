-- FASE 1: Limpeza de Duplicações e Correção de Inconsistências

-- 1. Remover evento duplicado da tabela agenda_itens (manter apenas na events)
UPDATE agenda_itens 
SET 
  status = 'draft',
  updated_at = NOW()
WHERE id = 'b395a531-11c7-4fc8-a54e-935fc78cacc5'
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE id = 'b395a531-11c7-4fc8-a54e-935fc78cacc5'
  );

-- 2. Remover entity_profile órfão (artista inexistente)
DELETE FROM entity_profiles 
WHERE id = 'fb38a09e-0d43-4ac1-812e-6e02e7f86b9d'
  AND source_id = '7c55ac4c-9989-4de5-a175-928fa872f51b'
  AND type = 'artista'
  AND NOT EXISTS (
    SELECT 1 FROM artists WHERE id = '7c55ac4c-9989-4de5-a175-928fa872f51b'
  );

-- 3. Remover lineup slots vazios (sem artistas)
DELETE FROM event_lineup_slots 
WHERE id IN (
  'c79bcc4e-6f1d-467c-8825-ca8531c3f36b',
  '38a780e0-8e0d-4b29-b858-d911ec93a53f'
)
AND NOT EXISTS (
  SELECT 1 FROM event_lineup_slot_artists 
  WHERE slot_id = event_lineup_slots.id
);

-- 4. Criar função de auditoria para detectar futuras inconsistências
CREATE OR REPLACE FUNCTION audit_database_consistency()
RETURNS TABLE(
  issue_type text,
  table_name text,
  record_id uuid,
  description text,
  severity text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Duplicações entre events e agenda_itens
  RETURN QUERY
  WITH duplicates AS (
    SELECT 
      e.title,
      e.date_start::date as event_date,
      e.city,
      count(*) as total_count
    FROM (
      SELECT title, date_start, city, id FROM events WHERE status = 'published'
      UNION ALL
      SELECT title, starts_at, city, id FROM agenda_itens WHERE status = 'published'
    ) e
    GROUP BY e.title, e.date_start::date, e.city
    HAVING count(*) > 1
  )
  SELECT 
    'duplicate_events'::text,
    'events/agenda_itens'::text,
    NULL::uuid,
    'Evento duplicado: ' || d.title || ' em ' || d.city,
    'high'::text
  FROM duplicates d;

  -- Entity profiles órfãos
  RETURN QUERY
  SELECT 
    'orphan_entity_profile'::text,
    'entity_profiles'::text,
    ep.id,
    'Entity profile órfão: ' || ep.name || ' (tipo: ' || ep.type || ')',
    'medium'::text
  FROM entity_profiles ep
  WHERE ep.source_id IS NOT NULL
    AND (
      (ep.type = 'artista' AND NOT EXISTS (SELECT 1 FROM artists WHERE id = ep.source_id))
      OR (ep.type = 'organizador' AND NOT EXISTS (SELECT 1 FROM organizers WHERE id = ep.source_id))
      OR (ep.type = 'venue' AND NOT EXISTS (SELECT 1 FROM venues WHERE id = ep.source_id))
    );

  -- Lineup slots vazios
  RETURN QUERY
  SELECT 
    'empty_lineup_slot'::text,
    'event_lineup_slots'::text,
    els.id,
    'Slot vazio: ' || els.slot_name || ' no evento ' || COALESCE(e.title, 'Unknown'),
    'low'::text
  FROM event_lineup_slots els
  LEFT JOIN events e ON e.id = els.event_id
  WHERE NOT EXISTS (
    SELECT 1 FROM event_lineup_slot_artists elsa 
    WHERE elsa.slot_id = els.id
  );
END;
$$;