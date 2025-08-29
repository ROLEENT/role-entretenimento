-- Criar bucket para capas da revista se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('revista-covers', 'revista-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket revista-covers
CREATE POLICY "Admins can upload covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'revista-covers' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update covers" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'revista-covers' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete covers" ON storage.objects
FOR DELETE USING (
  bucket_id = 'revista-covers' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view covers" ON storage.objects
FOR SELECT USING (bucket_id = 'revista-covers');

-- Adicionar campos que podem estar faltando na tabela blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS content_md text,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS cover_alt text;

-- Função para verificar slug duplicado
CREATE OR REPLACE FUNCTION check_blog_slug_available(p_slug text, p_post_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se slug já existe (excluindo o próprio post se estiver editando)
  RETURN NOT EXISTS(
    SELECT 1 FROM public.blog_posts 
    WHERE slug_data = p_slug 
    AND (p_post_id IS NULL OR id != p_post_id)
  );
END;
$$;

-- Função para admins gerenciarem blog posts
CREATE OR REPLACE FUNCTION admin_get_blog_posts(
  p_search text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_status article_status DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  title text,
  slug text,
  slug_data text,
  city text,
  status article_status,
  featured boolean,
  author_name text,
  published_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  views integer,
  cover_image text,
  summary text,
  tags text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin necessária';
  END IF;

  RETURN QUERY
  SELECT 
    bp.id,
    bp.title,
    bp.slug,
    bp.slug_data,
    bp.city,
    bp.status,
    bp.featured,
    bp.author_name,
    bp.published_at,
    bp.created_at,
    bp.updated_at,
    bp.views,
    bp.cover_image,
    bp.summary,
    bp.tags
  FROM public.blog_posts bp
  WHERE 
    (p_search IS NULL OR bp.title ILIKE '%' || p_search || '%' OR bp.slug_data ILIKE '%' || p_search || '%')
    AND (p_city IS NULL OR bp.city = p_city)
    AND (p_status IS NULL OR bp.status = p_status)
  ORDER BY bp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;