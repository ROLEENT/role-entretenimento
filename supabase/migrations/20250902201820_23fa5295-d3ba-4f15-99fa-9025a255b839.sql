-- Fix security issues identified by linter

-- Fix function search_path issues for security functions
CREATE OR REPLACE FUNCTION public.to_slug(input_text text)
RETURNS citext
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT regexp_replace(
    lower(
      unaccent(
        regexp_replace(trim(input_text), '[^\w\s-]', '', 'g')
      )
    ), 
    '[^a-z0-9]+', '-', 'g'
  )::citext;
$$;

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