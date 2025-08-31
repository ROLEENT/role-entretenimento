-- Create genres table
CREATE TABLE public.genres (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Create policies for genres
CREATE POLICY "Anyone can view active genres" 
ON public.genres 
FOR SELECT 
USING (active = true);

CREATE POLICY "Authenticated users can manage genres" 
ON public.genres 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_genres_updated_at
BEFORE UPDATE ON public.genres
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_genres_name ON public.genres USING btree(name);
CREATE INDEX idx_genres_slug ON public.genres USING btree(slug);
CREATE INDEX idx_genres_active ON public.genres USING btree(active);

-- Update artist_types policies to allow authenticated management
DROP POLICY IF EXISTS "artist_types_rw" ON public.artist_types;

CREATE POLICY "Anyone can view active artist types" 
ON public.artist_types 
FOR SELECT 
USING (active = true);

CREATE POLICY "Authenticated users can manage artist types" 
ON public.artist_types 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);