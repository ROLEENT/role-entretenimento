-- Fix missing organizer association for PROBLEMÓN #2 event
INSERT INTO public.agenda_item_organizers (agenda_id, organizer_id, main_organizer, role, position)
VALUES (
  '40c87b95-8e91-468a-8772-d6bc9b125961'::uuid, -- PROBLEMÓN #2 event ID
  'ea9f3154-5048-432d-a85b-e1fc28aa9538'::uuid, -- Problemón organizer ID
  true, -- main_organizer
  'organizer', -- role
  0 -- position
)
ON CONFLICT (agenda_id, organizer_id) DO UPDATE SET
  main_organizer = EXCLUDED.main_organizer,
  role = EXCLUDED.role,
  position = EXCLUDED.position;