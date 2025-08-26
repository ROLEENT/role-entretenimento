-- Add missing columns to venues table for admin management
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS map_url text,
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS contacts_json jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add index for slug
CREATE INDEX IF NOT EXISTS idx_venues_slug ON public.venues(slug);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_venue_slug(venue_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from name
  base_slug := lower(trim(venue_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check if slug already exists and increment counter if needed
  WHILE EXISTS (SELECT 1 FROM public.venues WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;