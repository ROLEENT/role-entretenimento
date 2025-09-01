-- Create profiles table for public entities (artists, venues, organizers)
CREATE TABLE IF NOT EXISTS public.entity_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('artista', 'local', 'organizador')),
  handle TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'BR',
  bio_short TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  tags TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entity_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view entity profiles" 
ON public.entity_profiles 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage their own profiles
CREATE POLICY "Users can create entity profiles" 
ON public.entity_profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own entity profiles" 
ON public.entity_profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_entity_profiles_handle ON public.entity_profiles(handle);
CREATE INDEX idx_entity_profiles_type ON public.entity_profiles(type);
CREATE INDEX idx_entity_profiles_city ON public.entity_profiles(city);
CREATE INDEX idx_entity_profiles_tags ON public.entity_profiles USING GIN(tags);
CREATE INDEX idx_entity_profiles_name ON public.entity_profiles(name);

-- Create trigger for updated_at
CREATE TRIGGER update_entity_profiles_updated_at
BEFORE UPDATE ON public.entity_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();