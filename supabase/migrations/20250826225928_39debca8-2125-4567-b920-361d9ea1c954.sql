-- FASE 1 EMERGENCIAL: Correções RLS e Políticas Básicas (FINAL)

-- 1. Remover políticas conflitantes
DROP POLICY IF EXISTS "Acesso temporário eventos desenvolvimento" ON public.events;
DROP POLICY IF EXISTS "Acesso temporário venues desenvolvimento" ON public.venues;
DROP POLICY IF EXISTS "Acesso temporário organizers desenvolvimento" ON public.organizers;
DROP POLICY IF EXISTS "Acesso temporário blog_posts desenvolvimento" ON public.blog_posts;
DROP POLICY IF EXISTS "Acesso temporário categories desenvolvimento" ON public.categories;

-- 2. Remover funções existentes que podem conflitar
DROP FUNCTION IF EXISTS public.admin_create_event CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_event CASCADE;

-- 3. Criar políticas permissivas para desenvolvimento
CREATE POLICY "dev_events_all_access"
  ON public.events FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_venues_all_access"
  ON public.venues FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_organizers_all_access"
  ON public.organizers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_blog_posts_all_access"
  ON public.blog_posts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_categories_all_access"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Função para criar eventos
CREATE FUNCTION public.admin_create_event(
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

-- 5. Função para atualizar eventos
CREATE FUNCTION public.admin_update_event(
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