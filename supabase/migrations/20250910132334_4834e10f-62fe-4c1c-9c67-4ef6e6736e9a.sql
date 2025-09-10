-- Limpeza completa dos eventos problemáticos
-- IDs dos eventos a serem removidos:
-- afc6a9b5-61ca-4e4f-a76a-28692ca7f475 (Hate Moss)
-- b395a531-11c7-4fc8-a54e-935fc78cacc5 (FINAL DRAG RACE BR)
-- 40c87b95-8e91-468a-8772-d6bc9b125961 (PROBLEMÓN #2)

-- 1. Remover relacionamentos em tabelas de junção
DELETE FROM public.event_lineup_slots 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.event_lineup_slot_artists 
WHERE slot_id IN (
  SELECT id FROM public.event_lineup_slots 
  WHERE event_id IN (
    'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
    'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
    '40c87b95-8e91-468a-8772-d6bc9b125961'
  )
);

DELETE FROM public.event_partners 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.event_performances 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.event_visual_artists 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.event_curation_criteria 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

-- 2. Remover de tabelas de interação de usuário
DELETE FROM public.event_favorites 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.event_checkins 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.event_reviews 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.event_comments 
WHERE event_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

-- 3. Remover relacionamentos em agenda_itens
DELETE FROM public.agenda_item_artists 
WHERE agenda_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.agenda_item_organizers 
WHERE agenda_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.agenda_media 
WHERE agenda_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.agenda_occurrences 
WHERE agenda_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.agenda_ticket_tiers 
WHERE agenda_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

DELETE FROM public.agenda_slug_history 
WHERE agenda_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

-- 4. Remover eventos principais da tabela events
DELETE FROM public.events 
WHERE id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

-- 5. Remover eventos da tabela agenda_itens
DELETE FROM public.agenda_itens 
WHERE id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

-- 6. Limpar referências órfãs em activity_feed se existir
DELETE FROM public.activity_feed 
WHERE object_type = 'event' 
AND object_id IN (
  'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
  'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
  '40c87b95-8e91-468a-8772-d6bc9b125961'
);

-- Log da operação de limpeza
INSERT INTO public.admin_audit_log (
  admin_email,
  action,
  table_name,
  record_id,
  new_values
) VALUES (
  'system',
  'CLEANUP_EVENTS',
  'events_cleanup',
  gen_random_uuid(),
  jsonb_build_object(
    'action', 'cleanup_problematic_events',
    'event_ids', ARRAY[
      'afc6a9b5-61ca-4e4f-a76a-28692ca7f475',
      'b395a531-11c7-4fc8-a54e-935fc78cacc5', 
      '40c87b95-8e91-468a-8772-d6bc9b125961'
    ],
    'reason', 'inaccessible_events_cleanup',
    'timestamp', NOW()
  )
);