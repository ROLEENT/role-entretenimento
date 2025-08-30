-- Create venue_types table
CREATE TABLE IF NOT EXISTS public.venue_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venue_types ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view venue types" 
ON public.venue_types 
FOR SELECT 
USING (true);

-- Insert seed data
INSERT INTO public.venue_types (name, slug) VALUES
  ('Casa de show', 'casa-de-show'),
  ('Teatro', 'teatro'),
  ('Arena', 'arena'),
  ('Clube', 'clube'),
  ('Bar', 'bar'),
  ('Centro cultural', 'centro-cultural'),
  ('Galeria', 'galeria'),
  ('Cinema', 'cinema'),
  ('Espaço público', 'espaco-publico')
ON CONFLICT (slug) DO NOTHING;

-- Add venue_type_id to venues table (not agents)
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS venue_type_id BIGINT REFERENCES public.venue_types(id);

-- Add updated_at trigger
CREATE TRIGGER update_venue_types_updated_at
  BEFORE UPDATE ON public.venue_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();