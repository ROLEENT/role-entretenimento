-- Ensure categories table has the correct structure and constraints
-- Add missing columns if needed and update RLS policies

-- Add any missing columns and constraints
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS type category_type DEFAULT 'general',
ADD COLUMN IF NOT EXISTS color_hex text DEFAULT '#3B82F6';

-- Ensure unique constraints exist
ALTER TABLE public.categories 
ADD CONSTRAINT categories_name_unique UNIQUE (name) NOT DEFERRABLE,
ADD CONSTRAINT categories_slug_unique UNIQUE (slug) NOT DEFERRABLE;

-- Update color_hex from existing color column if it exists
UPDATE public.categories 
SET color_hex = COALESCE(color, '#3B82F6')
WHERE color_hex IS NULL;

-- Drop the old color column if it exists and we've migrated data
ALTER TABLE public.categories DROP COLUMN IF EXISTS color;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);

-- Ensure RLS policies are optimal
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage categories new" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')))
WITH CHECK (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- Function to validate category data before insert/update
CREATE OR REPLACE FUNCTION public.validate_category_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate name is not empty
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'Nome da categoria é obrigatório';
  END IF;
  
  -- Generate slug from name if not provided
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    NEW.slug := lower(trim(regexp_replace(NEW.name, '[^a-zA-Z0-9\s]', '', 'g')));
    NEW.slug := regexp_replace(NEW.slug, '\s+', '-', 'g');
    NEW.slug := trim(NEW.slug, '-');
  END IF;
  
  -- Ensure color_hex has # prefix
  IF NEW.color_hex IS NOT NULL AND NOT NEW.color_hex ~ '^#[0-9A-Fa-f]{6}$' THEN
    -- Try to fix common color formats
    IF NEW.color_hex ~ '^[0-9A-Fa-f]{6}$' THEN
      NEW.color_hex := '#' || NEW.color_hex;
    ELSE
      NEW.color_hex := '#3B82F6'; -- Default blue
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_category_data_trigger ON public.categories;
CREATE TRIGGER validate_category_data_trigger
  BEFORE INSERT OR UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_category_data();