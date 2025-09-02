-- Fix by dropping view first, then updating column, then recreating view

-- Drop the view that depends on the slug column
DROP VIEW IF EXISTS public.genres_with_hierarchy;

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

-- Recreate the hierarchical view
CREATE OR REPLACE VIEW public.genres_with_hierarchy AS
SELECT 
  g.id,
  g.name,
  g.slug,
  g.source,
  g.is_active,
  g.active,
  g.parent_genre_id,
  pg.name as parent_name,
  pg.slug as parent_slug,
  g.created_at,
  g.updated_at
FROM public.genres g
LEFT JOIN public.genres pg ON g.parent_genre_id = pg.id;

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