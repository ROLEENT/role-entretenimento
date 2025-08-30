-- Add the kind column to categories table to replace type
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'ambos' 
CHECK (kind IN ('revista', 'agenda', 'ambos'));

-- Add is_active column if it doesn't exist
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Update existing categories to use the new kind system
UPDATE public.categories 
SET kind = CASE 
  WHEN type = 'blog'::category_type THEN 'revista'
  WHEN type = 'music'::category_type THEN 'ambos'
  WHEN type = 'art'::category_type THEN 'ambos'
  WHEN type = 'food'::category_type THEN 'ambos'
  WHEN type = 'sports'::category_type THEN 'agenda'
  WHEN type = 'technology'::category_type THEN 'revista'
  WHEN type = 'business'::category_type THEN 'revista'
  ELSE 'ambos'
END
WHERE kind = 'ambos'; -- Only update if still default

-- Inactivate any existing "Vitrine Cultural" categories
UPDATE public.categories 
SET is_active = false 
WHERE LOWER(name) LIKE '%vitrine%' OR LOWER(name) LIKE '%vitrine cultural%';

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_kind ON public.categories (kind);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories (is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug_unique ON public.categories (slug) WHERE is_active = true;