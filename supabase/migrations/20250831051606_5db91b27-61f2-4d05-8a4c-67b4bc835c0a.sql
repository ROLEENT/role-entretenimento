-- Ensure genres table exists with proper structure
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on genres
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Create policies for genres
CREATE POLICY "Anyone can view active genres" 
ON public.genres 
FOR SELECT 
USING (active = true);

CREATE POLICY "Authenticated users can manage genres" 
ON public.genres 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create updated_at trigger for genres
CREATE OR REPLACE FUNCTION public.update_genres_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_genres_updated_at
BEFORE UPDATE ON public.genres
FOR EACH ROW
EXECUTE FUNCTION public.update_genres_updated_at();

-- Insert some default genres if table is empty
INSERT INTO public.genres (name, slug) 
SELECT name, lower(replace(name, ' ', '-'))
FROM (VALUES 
  ('House'),
  ('Techno'),
  ('Deep House'),
  ('Progressive House'),
  ('Tech House'),
  ('Minimal'),
  ('Disco'),
  ('Funk'),
  ('Rock'),
  ('Pop'),
  ('Electronic'),
  ('Ambient')
) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM public.genres LIMIT 1);