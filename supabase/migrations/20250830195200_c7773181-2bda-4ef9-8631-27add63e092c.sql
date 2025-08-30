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
  WHEN type = 'event'::category_type THEN 'agenda' 
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
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

-- Add some default categories if none exist
INSERT INTO public.categories (name, slug, kind, is_active, color, created_at)
VALUES 
  ('Música', 'musica', 'ambos', true, '#3B82F6', now()),
  ('Teatro', 'teatro', 'ambos', true, '#8B5CF6', now()),
  ('Arte', 'arte', 'ambos', true, '#10B981', now()),
  ('Gastronomia', 'gastronomia', 'ambos', true, '#F59E0B', now()),
  ('Lifestyle', 'lifestyle', 'revista', true, '#EF4444', now()),
  ('Cultura', 'cultura', 'revista', true, '#6366F1', now())
ON CONFLICT (slug) DO NOTHING;

-- Update RLS policies for categories to be more permissive for admins
DROP POLICY IF EXISTS "dev_categories_all_access" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

-- New RLS policies
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
      AND is_active = true
    )
  );

-- Create a function to get categories by kind
CREATE OR REPLACE FUNCTION public.get_categories_by_kind(p_kind text DEFAULT 'ambos')
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  kind text,
  color text,
  description text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.kind,
    c.color,
    c.description,
    c.is_active,
    c.created_at
  FROM public.categories c
  WHERE c.is_active = true 
    AND (p_kind = 'ambos' OR c.kind = p_kind OR c.kind = 'ambos')
  ORDER BY c.name;
$$;