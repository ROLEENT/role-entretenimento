-- Simplified migration without unaccent and with proper extensions
-- Create a basic slug function that doesn't require unaccent extension

-- Drop existing function first
DROP FUNCTION IF EXISTS public.to_slug(text);

-- Create simplified slug function without unaccent dependency
CREATE OR REPLACE FUNCTION public.to_slug(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT regexp_replace(
    lower(trim(input_text)), 
    '[^a-z0-9]+', '-', 'g'
  );
$$;

-- Update the slug column to be text
ALTER TABLE public.genres ALTER COLUMN slug TYPE text;

-- Make sure all existing slugs are generated
UPDATE public.genres SET slug = public.to_slug(name) WHERE slug IS NULL OR slug = '';

-- Recreate the trigger function with corrected security settings
CREATE OR REPLACE FUNCTION public.genres_update_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-generate slug if not provided or changed
  IF NEW.slug IS NULL OR NEW.slug = '' OR (OLD.name IS DISTINCT FROM NEW.name) THEN
    NEW.slug := public.to_slug(NEW.name);
  END IF;
  
  -- Update timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;

-- Recreate the activate function with proper security
CREATE OR REPLACE FUNCTION public.activate_genre_and_parents(genre_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_id uuid := genre_id;
  parent_id uuid;
BEGIN
  -- Activate the genre and walk up the hierarchy
  WHILE current_id IS NOT NULL LOOP
    UPDATE public.genres 
    SET is_active = true, updated_at = now() 
    WHERE id = current_id AND is_active = false;
    
    SELECT parent_genre_id INTO parent_id 
    FROM public.genres 
    WHERE id = current_id;
    
    current_id := parent_id;
  END LOOP;
END;
$$;