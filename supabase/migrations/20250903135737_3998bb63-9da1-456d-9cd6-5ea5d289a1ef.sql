-- Create agenda_item_organizers table similar to agenda_item_artists
CREATE TABLE public.agenda_item_organizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agenda_id UUID NOT NULL,
  organizer_id UUID NOT NULL,
  role TEXT DEFAULT 'organizer',
  position INTEGER DEFAULT 0,
  main_organizer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agenda_item_organizers ENABLE ROW LEVEL SECURITY;

-- Create policies for organizers management
CREATE POLICY "Admins can manage agenda item organizers" 
ON public.agenda_item_organizers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
));

CREATE POLICY "Anyone can view agenda item organizers" 
ON public.agenda_item_organizers 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_agenda_item_organizers_agenda_id ON public.agenda_item_organizers(agenda_id);
CREATE INDEX idx_agenda_item_organizers_organizer_id ON public.agenda_item_organizers(organizer_id);
CREATE INDEX idx_agenda_item_organizers_main ON public.agenda_item_organizers(agenda_id, main_organizer) WHERE main_organizer = true;

-- Migrate existing organizers from organizer_id field
INSERT INTO public.agenda_item_organizers (agenda_id, organizer_id, main_organizer, position)
SELECT id, organizer_id, true, 0
FROM public.agenda_itens 
WHERE organizer_id IS NOT NULL;