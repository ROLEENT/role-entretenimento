-- FASE 1 EMERGENCIAL: Correções RLS e Políticas Básicas

-- 1. Adicionar políticas RLS permissivas para desenvolvimento
-- Tabelas sem políticas que precisam de acesso básico

-- Política temporária para tabela events (desenvolvimento)
CREATE POLICY IF NOT EXISTS "Acesso temporário eventos desenvolvimento"
  ON public.events FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política temporária para tabela venues (desenvolvimento)  
CREATE POLICY IF NOT EXISTS "Acesso temporário venues desenvolvimento"
  ON public.venues FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política temporária para tabela organizers (desenvolvimento)
CREATE POLICY IF NOT EXISTS "Acesso temporário organizers desenvolvimento"
  ON public.organizers FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política temporária para tabela blog_posts (desenvolvimento)
CREATE POLICY IF NOT EXISTS "Acesso temporário blog_posts desenvolvimento"
  ON public.blog_posts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política temporária para tabela categories (desenvolvimento)
CREATE POLICY IF NOT EXISTS "Acesso temporário categories desenvolvimento"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Funções administrativas básicas para eventos
CREATE OR REPLACE FUNCTION public.admin_create_event(
  p_title text,
  p_slug text,
  p_city text,
  p_venue_id uuid DEFAULT NULL,
  p_start_at timestamp with time zone DEFAULT NULL,
  p_end_at timestamp with time zone DEFAULT NULL,
  p_organizer_id uuid DEFAULT NULL,
  p_cover_url text DEFAULT NULL,
  p_tags text[] DEFAULT '{}',
  p_status text DEFAULT 'active'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_event_id uuid;
BEGIN
  INSERT INTO public.events (
    title, slug, city, venue_id, date_start, date_end,
    organizer_id, cover_url, tags, status
  )
  VALUES (
    p_title, p_slug, p_city, p_venue_id, p_start_at, p_end_at,
    p_organizer_id, p_cover_url, p_tags, p_status
  )
  RETURNING id INTO new_event_id;
  
  RETURN new_event_id;
END;
$$;

-- 3. Função para atualizar eventos
CREATE OR REPLACE FUNCTION public.admin_update_event(
  p_event_id uuid,
  p_title text,
  p_slug text,
  p_city text,
  p_venue_id uuid DEFAULT NULL,
  p_start_at timestamp with time zone DEFAULT NULL,
  p_end_at timestamp with time zone DEFAULT NULL,
  p_organizer_id uuid DEFAULT NULL,
  p_cover_url text DEFAULT NULL,
  p_tags text[] DEFAULT '{}',
  p_status text DEFAULT 'active'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.events SET
    title = p_title,
    slug = p_slug,
    city = p_city,
    venue_id = p_venue_id,
    date_start = p_start_at,
    date_end = p_end_at,
    organizer_id = p_organizer_id,
    cover_url = p_cover_url,
    tags = p_tags,
    status = p_status,
    updated_at = NOW()
  WHERE id = p_event_id;
  
  RETURN true;
END;
$$;

-- 4. Função para criar blog posts
CREATE OR REPLACE FUNCTION public.admin_create_blog_post(
  p_title text,
  p_slug text,
  p_content_html text,
  p_summary text,
  p_city text,
  p_author_name text,
  p_cover_image text DEFAULT NULL,
  p_status text DEFAULT 'draft'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_post_id uuid;
  mock_author_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  INSERT INTO public.blog_posts (
    title, slug, content_html, summary, city, author_name, 
    cover_image, status, author_id
  )
  VALUES (
    p_title, p_slug, p_content_html, p_summary, p_city, p_author_name,
    p_cover_image, p_status, mock_author_id
  )
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$;