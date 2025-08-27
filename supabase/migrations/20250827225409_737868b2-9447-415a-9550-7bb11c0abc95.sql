-- Create event_engagement table for the new engagement system
CREATE TABLE public.event_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  highlight_id UUID REFERENCES public.highlights(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('interest', 'bought_ticket', 'will_attend')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT event_engagement_user_entity_type_unique UNIQUE (user_id, COALESCE(event_id, highlight_id), engagement_type),
  CONSTRAINT event_engagement_entity_check CHECK (
    (event_id IS NOT NULL AND highlight_id IS NULL) OR 
    (event_id IS NULL AND highlight_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.event_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies for event_engagement
CREATE POLICY "Users can view all engagement data" 
ON public.event_engagement 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own engagement" 
ON public.event_engagement 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagement" 
ON public.event_engagement 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own engagement" 
ON public.event_engagement 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_event_engagement_updated_at
BEFORE UPDATE ON public.event_engagement
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from highlight_likes to event_engagement
INSERT INTO public.event_engagement (user_id, highlight_id, engagement_type, created_at)
SELECT user_id, highlight_id, 'interest', created_at
FROM public.highlight_likes
ON CONFLICT (user_id, COALESCE(event_id, highlight_id), engagement_type) DO NOTHING;

-- Migrate existing data from event_favorites to event_engagement  
INSERT INTO public.event_engagement (user_id, event_id, engagement_type, created_at)
SELECT user_id, event_id, 'interest', created_at
FROM public.event_favorites
ON CONFLICT (user_id, COALESCE(event_id, highlight_id), engagement_type) DO NOTHING;