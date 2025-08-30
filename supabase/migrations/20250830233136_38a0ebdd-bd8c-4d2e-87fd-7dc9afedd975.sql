-- Check if venue_types table exists, create if not
CREATE TABLE IF NOT EXISTS public.venue_types (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default venue types if table is empty
INSERT INTO public.venue_types (name, slug) VALUES
  ('Casa de Show', 'casa-de-show'),
  ('Teatro', 'teatro'), 
  ('Clube', 'clube'),
  ('Arena', 'arena'),
  ('Bar', 'bar'),
  ('Restaurante', 'restaurante'),
  ('Pub', 'pub'),
  ('Lounge', 'lounge'),
  ('Espaço Aberto', 'espaco-aberto'),
  ('Centro Cultural', 'centro-cultural'),
  ('Galeria', 'galeria'),
  ('Estúdio', 'estudio'),
  ('Galpão', 'galpao'),
  ('Outro', 'outro')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE public.venue_types ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view venue types" 
ON public.venue_types 
FOR SELECT 
USING (true);