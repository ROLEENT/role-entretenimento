-- Fix missing organizer association for PROBLEMÓN #2 event
INSERT INTO public.agenda_item_organizers (agenda_id, organizer_id, main_organizer, role, position)
SELECT 
  '40c87b95-8e91-468a-8772-d6bc9b125961'::uuid, -- PROBLEMÓN #2 event ID
  'ea9f3154-5048-432d-a85b-e1fc28aa9538'::uuid, -- Problemón organizer ID
  true, -- main_organizer
  'organizer', -- role
  0 -- position
WHERE NOT EXISTS (
  SELECT 1 FROM public.agenda_item_organizers 
  WHERE agenda_id = '40c87b95-8e91-468a-8772-d6bc9b125961'::uuid 
    AND organizer_id = 'ea9f3154-5048-432d-a85b-e1fc28aa9538'::uuid
);