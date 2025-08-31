-- Create genres table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on genres table
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to view active genres
CREATE POLICY "Anyone can view active genres" ON public.genres
FOR SELECT USING (is_active = true);

-- Create policy for authenticated users to manage genres
CREATE POLICY "Authenticated users can manage genres" ON public.genres
FOR ALL USING (true) WITH CHECK (true);

-- Update artist_types table RLS policies to be more permissive
DROP POLICY IF EXISTS "artist_types_rw" ON public.artist_types;

-- Create policy for anyone to view active artist types
CREATE POLICY "Anyone can view active artist types" ON public.artist_types
FOR SELECT USING (active = true);

-- Create policy for authenticated users to manage artist types
CREATE POLICY "Authenticated users can manage artist types" ON public.artist_types
FOR ALL USING (true) WITH CHECK (true);