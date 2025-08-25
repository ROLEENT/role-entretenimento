-- Corrigir problemas de RLS e policies para highlights

-- 1. CORRIGIR RLS POLICIES DOS HIGHLIGHTS
-- Remover policies muito permissivas e criar policies específicas para admins
DROP POLICY IF EXISTS "Admins can delete highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins can insert highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins can update highlights" ON public.highlights;

-- Criar policies corretas baseadas na validação de admin
CREATE POLICY "Admins podem gerenciar highlights - insert" ON public.highlights 
FOR INSERT WITH CHECK (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "Admins podem gerenciar highlights - update" ON public.highlights 
FOR UPDATE USING (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
) WITH CHECK (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "Admins podem gerenciar highlights - delete" ON public.highlights 
FOR DELETE USING (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

-- 2. CORRIGIR BUCKET HIGHLIGHTS E SUAS POLICIES
-- Garantir que o bucket highlights existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('highlights', 'highlights', true) 
ON CONFLICT (id) DO NOTHING;

-- Remover policies antigas do bucket highlights
DROP POLICY IF EXISTS "Public can view highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete highlight images" ON storage.objects;

-- Criar policies corretas para o bucket highlights
CREATE POLICY "Qualquer um pode ver imagens de highlights" ON storage.objects 
FOR SELECT USING (bucket_id = 'highlights');

CREATE POLICY "Admins podem fazer upload de imagens de highlights" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "Admins podem atualizar imagens de highlights" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
) WITH CHECK (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "Admins podem deletar imagens de highlights" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

-- 3. MELHORAR FUNÇÕES ADMIN COM MAIS LOGGING E VALIDAÇÃO
CREATE OR REPLACE FUNCTION public.admin_create_highlight_v2(
  p_admin_email text,
  p_city city,
  p_event_title text,
  p_venue text,
  p_ticket_url text,
  p_role_text character varying,
  p_selection_reasons text[],
  p_image_url text,
  p_photo_credit text,
  p_event_date date,
  p_event_time time without time zone,
  p_ticket_price text,
  p_sort_order integer,
  p_is_published boolean
) RETURNS TABLE(
  id uuid, city city, event_title text, venue text, ticket_url text, role_text character varying,
  selection_reasons text[], image_url text, photo_credit text, event_date date,
  event_time time without time zone, ticket_price text, sort_order integer,
  is_published boolean, like_count integer, created_at timestamp with time zone,
  updated_at timestamp with time zone
) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  new_highlight_id uuid;
  admin_valid boolean;
BEGIN
  -- Log da tentativa
  RAISE NOTICE 'Tentativa de criação de highlight por admin: %', p_admin_email;
  
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  RAISE NOTICE 'Admin válido: %', admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Validar dados obrigatórios
  IF p_event_title IS NULL OR length(trim(p_event_title)) = 0 THEN
    RAISE EXCEPTION 'Título do evento é obrigatório';
  END IF;
  
  IF p_venue IS NULL OR length(trim(p_venue)) = 0 THEN
    RAISE EXCEPTION 'Local é obrigatório';
  END IF;
  
  IF p_role_text IS NULL OR length(trim(p_role_text)) = 0 THEN
    RAISE EXCEPTION 'Texto do ROLE é obrigatório';
  END IF;
  
  IF p_image_url IS NULL OR length(trim(p_image_url)) = 0 THEN
    RAISE EXCEPTION 'URL da imagem é obrigatória';
  END IF;

  -- Inserir o highlight
  INSERT INTO public.highlights (
    city, event_title, venue, 
    ticket_url, role_text, selection_reasons,
    image_url, photo_credit, event_date, 
    event_time, ticket_price, sort_order, 
    is_published
  ) VALUES (
    p_city, p_event_title, p_venue,
    NULLIF(trim(p_ticket_url), ''), p_role_text, COALESCE(p_selection_reasons, '{}'),
    p_image_url, NULLIF(trim(p_photo_credit), ''), p_event_date,
    p_event_time, NULLIF(trim(p_ticket_price), ''), COALESCE(p_sort_order, 100),
    COALESCE(p_is_published, false)
  ) RETURNING highlights.id INTO new_highlight_id;

  RAISE NOTICE 'Highlight criado com ID: %', new_highlight_id;

  -- Retornar dados do highlight criado
  RETURN QUERY
  SELECT 
    h.id, h.city, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE h.id = new_highlight_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_highlight_v2(
  p_admin_email text,
  p_highlight_id uuid,
  p_city city,
  p_event_title text,
  p_venue text,
  p_ticket_url text,
  p_role_text character varying,
  p_selection_reasons text[],
  p_image_url text,
  p_photo_credit text,
  p_event_date date,
  p_event_time time without time zone,
  p_ticket_price text,
  p_sort_order integer,
  p_is_published boolean
) RETURNS TABLE(
  id uuid, city city, event_title text, venue text, ticket_url text, role_text character varying,
  selection_reasons text[], image_url text, photo_credit text, event_date date,
  event_time time without time zone, ticket_price text, sort_order integer,
  is_published boolean, like_count integer, created_at timestamp with time zone,
  updated_at timestamp with time zone
) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  admin_valid boolean;
  highlight_exists boolean;
BEGIN
  -- Log da tentativa
  RAISE NOTICE 'Tentativa de atualização de highlight % por admin: %', p_highlight_id, p_admin_email;
  
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  RAISE NOTICE 'Admin válido: %', admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se highlight existe
  SELECT EXISTS(SELECT 1 FROM public.highlights WHERE id = p_highlight_id) INTO highlight_exists;
  
  IF NOT highlight_exists THEN
    RAISE EXCEPTION 'Destaque não encontrado (ID: %)', p_highlight_id;
  END IF;

  -- Validar dados obrigatórios
  IF p_event_title IS NULL OR length(trim(p_event_title)) = 0 THEN
    RAISE EXCEPTION 'Título do evento é obrigatório';
  END IF;
  
  IF p_venue IS NULL OR length(trim(p_venue)) = 0 THEN
    RAISE EXCEPTION 'Local é obrigatório';
  END IF;
  
  IF p_role_text IS NULL OR length(trim(p_role_text)) = 0 THEN
    RAISE EXCEPTION 'Texto do ROLE é obrigatório';
  END IF;
  
  IF p_image_url IS NULL OR length(trim(p_image_url)) = 0 THEN
    RAISE EXCEPTION 'URL da imagem é obrigatória';
  END IF;

  -- Atualizar o highlight
  UPDATE public.highlights SET
    city = p_city, 
    event_title = p_event_title, 
    venue = p_venue,
    ticket_url = NULLIF(trim(p_ticket_url), ''), 
    role_text = p_role_text, 
    selection_reasons = COALESCE(p_selection_reasons, '{}'),
    image_url = p_image_url,
    photo_credit = NULLIF(trim(p_photo_credit), ''), 
    event_date = p_event_date,
    event_time = p_event_time, 
    ticket_price = NULLIF(trim(p_ticket_price), ''), 
    sort_order = COALESCE(p_sort_order, 100),
    is_published = COALESCE(p_is_published, false),
    updated_at = NOW()
  WHERE id = p_highlight_id;

  RAISE NOTICE 'Highlight % atualizado com sucesso', p_highlight_id;

  -- Retornar dados do highlight atualizado
  RETURN QUERY
  SELECT 
    h.id, h.city, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$$;

-- 4. FUNÇÃO DE DEBUG PARA TESTAR PERMISSÕES
CREATE OR REPLACE FUNCTION public.debug_admin_highlights(p_admin_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  admin_valid boolean;
  highlights_count integer;
  result jsonb;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  -- Tentar contar highlights
  SELECT COUNT(*) FROM public.highlights INTO highlights_count;
  
  result := jsonb_build_object(
    'admin_email', p_admin_email,
    'admin_valid', admin_valid,
    'highlights_count', highlights_count,
    'header_email', (current_setting('request.headers', true))::json->>'x-admin-email',
    'test_timestamp', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM,
    'admin_email', p_admin_email,
    'error_detail', SQLSTATE
  );
END;
$$;