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

-- Admin function to manage categories
CREATE OR REPLACE FUNCTION public.admin_manage_category(
  p_admin_email text,
  p_action text, -- 'create', 'update', 'delete'
  p_category_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_kind text DEFAULT 'ambos',
  p_description text DEFAULT NULL,
  p_color text DEFAULT '#3B82F6',
  p_is_active boolean DEFAULT true
)
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Verify admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  IF p_action = 'create' THEN
    INSERT INTO public.categories (name, slug, kind, description, color, is_active)
    VALUES (p_name, p_slug, p_kind, p_description, p_color, p_is_active)
    RETURNING categories.id INTO new_id;
    
    RETURN QUERY
    SELECT c.id, c.name, c.slug, c.kind, c.color, c.description, c.is_active, c.created_at
    FROM public.categories c
    WHERE c.id = new_id;
    
  ELSIF p_action = 'update' THEN
    UPDATE public.categories
    SET 
      name = COALESCE(p_name, name),
      slug = COALESCE(p_slug, slug),
      kind = COALESCE(p_kind, kind),
      description = COALESCE(p_description, description),
      color = COALESCE(p_color, color),
      is_active = COALESCE(p_is_active, is_active)
    WHERE categories.id = p_category_id;
    
    RETURN QUERY
    SELECT c.id, c.name, c.slug, c.kind, c.color, c.description, c.is_active, c.created_at
    FROM public.categories c
    WHERE c.id = p_category_id;
    
  ELSIF p_action = 'delete' THEN
    UPDATE public.categories
    SET is_active = false
    WHERE categories.id = p_category_id;
    
    RETURN QUERY
    SELECT c.id, c.name, c.slug, c.kind, c.color, c.description, c.is_active, c.created_at
    FROM public.categories c
    WHERE c.id = p_category_id;
  END IF;
END;
$$;