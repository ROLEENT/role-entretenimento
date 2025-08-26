-- Create enum for category types
DO $$ 
BEGIN
    CREATE TYPE category_type AS ENUM ('general', 'music', 'art', 'food', 'sports', 'technology', 'business');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Update categories table structure
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS color_hex text DEFAULT '#3B82F6';

-- Drop the existing type column and recreate with proper enum type
ALTER TABLE public.categories DROP COLUMN IF EXISTS type;
ALTER TABLE public.categories ADD COLUMN type category_type DEFAULT 'general';

-- Add unique constraints if they don't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.categories ADD CONSTRAINT categories_name_unique UNIQUE (name);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
    END;
END $$;

-- Create function to generate category slug
CREATE OR REPLACE FUNCTION generate_category_slug(category_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug
  base_slug := lower(trim(regexp_replace(category_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.categories WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create trigger for auto-generating slugs
CREATE OR REPLACE FUNCTION set_category_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_category_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS category_slug_trigger ON public.categories;
CREATE TRIGGER category_slug_trigger
  BEFORE INSERT OR UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION set_category_slug();