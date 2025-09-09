-- Migrate existing organizer_id data from events to agenda_item_organizers
INSERT INTO public.agenda_item_organizers (agenda_id, organizer_id, main_organizer, role, position)
SELECT 
  e.id as agenda_id,
  e.organizer_id,
  true as main_organizer,
  'organizer' as role,
  0 as position
FROM public.events e
WHERE e.organizer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.agenda_item_organizers aio 
    WHERE aio.agenda_id = e.id AND aio.organizer_id = e.organizer_id
  );