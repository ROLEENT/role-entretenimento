-- Upgrade genres table with complete structure
-- Add extensions for better performance and functionality
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add new columns to existing genres table
ALTER TABLE public.genres 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS parent_genre_id uuid REFERENCES public.genres(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update existing records to have proper values
UPDATE public.genres SET 
  source = 'manual',
  is_active = active,
  updated_at = now()
WHERE source IS NULL;

-- Create slug normalization function
CREATE OR REPLACE FUNCTION public.to_slug(input_text text)
RETURNS citext
LANGUAGE sql
IMMUTABLE
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

-- Create trigger function for auto-updating slug and updated_at
CREATE OR REPLACE FUNCTION public.genres_update_trigger()
RETURNS trigger
LANGUAGE plpgsql
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

-- Create triggers
DROP TRIGGER IF EXISTS trg_genres_update ON public.genres;
CREATE TRIGGER trg_genres_update
  BEFORE INSERT OR UPDATE ON public.genres
  FOR EACH ROW
  EXECUTE FUNCTION public.genres_update_trigger();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_genres_name_trgm ON public.genres USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_genres_slug ON public.genres (slug);
CREATE INDEX IF NOT EXISTS idx_genres_active ON public.genres (is_active);
CREATE INDEX IF NOT EXISTS idx_genres_source ON public.genres (source);
CREATE INDEX IF NOT EXISTS idx_genres_parent ON public.genres (parent_genre_id);

-- Create hierarchical view for easier querying
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

-- Update RLS policies for new structure
DROP POLICY IF EXISTS "Anyone can view active genres" ON public.genres;
CREATE POLICY "Anyone can view active genres" ON public.genres
  FOR SELECT USING (is_active = true OR active = true);

DROP POLICY IF EXISTS "Admins can manage genres" ON public.genres;
CREATE POLICY "Admins can manage genres" ON public.genres
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
      AND is_active = true
    )
  );

-- Function to activate related genres when one is used
CREATE OR REPLACE FUNCTION public.activate_genre_and_parents(genre_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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