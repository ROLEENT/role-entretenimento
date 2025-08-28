-- Limpeza total: Remover todas as versões das funções de highlights
DROP FUNCTION IF EXISTS admin_create_highlight_v2(text, city, text, text, text, character varying, text[], text, text, date, time, text, integer, boolean);
DROP FUNCTION IF EXISTS admin_update_highlight_v2(text, uuid, city, text, text, text, character varying, text[], text, text, date, time, text, integer, boolean);
DROP FUNCTION IF EXISTS admin_get_highlight_by_id(text, uuid);

-- Recriar função para criar highlight com estrutura correta
CREATE OR REPLACE FUNCTION admin_create_highlight_v2(
  p_admin_email text,
  p_city text,
  p_event_title text,
  p_venue text,
  p_ticket_url text DEFAULT '',
  p_role_text text DEFAULT '',
  p_selection_reasons text[] DEFAULT '{}',
  p_image_url text DEFAULT '',
  p_photo_credit text DEFAULT '',
  p_event_date text DEFAULT '',
  p_event_time text DEFAULT '',
  p_ticket_price text DEFAULT '',
  p_sort_order integer DEFAULT 100,
  p_is_published boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  city text,
  event_title text,
  venue text,
  ticket_url text,
  role_text text,
  selection_reasons text[],
  image_url text,
  photo_credit text,
  event_date text,
  event_time text,
  ticket_price text,
  sort_order integer,
  is_published boolean,
  like_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_highlight_id uuid;
  admin_valid boolean;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
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
  
  IF p_image_url IS NULL OR length(trim(p_image_url)) = 0 THEN
    RAISE EXCEPTION 'URL da imagem é obrigatória';
  END IF;

  -- Inserir o highlight
  INSERT INTO public.highlights (
    city,
    event_title,
    venue,
    ticket_url,
    role_text,
    selection_reasons,
    image_url,
    photo_credit,
    event_date,
    event_time,
    ticket_price,
    sort_order,
    is_published
  ) VALUES (
    p_city::city,
    p_event_title,
    p_venue,
    NULLIF(p_ticket_url, ''),
    p_role_text,
    COALESCE(p_selection_reasons, '{}'),
    p_image_url,
    NULLIF(p_photo_credit, ''),
    CASE WHEN p_event_date = '' THEN NULL ELSE p_event_date::date END,
    CASE WHEN p_event_time = '' THEN NULL ELSE p_event_time::time END,
    NULLIF(p_ticket_price, ''),
    p_sort_order,
    p_is_published
  ) RETURNING highlights.id INTO new_highlight_id;

  -- Retornar o highlight criado
  RETURN QUERY
  SELECT 
    h.id,
    h.city::text,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text::text,
    h.selection_reasons,
    h.image_url,
    h.photo_credit,
    h.event_date::text,
    h.event_time::text,
    h.ticket_price,
    h.sort_order,
    h.is_published,
    h.like_count,
    h.created_at,
    h.updated_at
  FROM public.highlights h
  WHERE h.id = new_highlight_id;
END;
$$;

-- Recriar função para atualizar highlight
CREATE OR REPLACE FUNCTION admin_update_highlight_v2(
  p_admin_email text,
  p_highlight_id uuid,
  p_city text,
  p_event_title text,
  p_venue text,
  p_ticket_url text DEFAULT '',
  p_role_text text DEFAULT '',
  p_selection_reasons text[] DEFAULT '{}',
  p_image_url text DEFAULT '',
  p_photo_credit text DEFAULT '',
  p_event_date text DEFAULT '',
  p_event_time text DEFAULT '',
  p_ticket_price text DEFAULT '',
  p_sort_order integer DEFAULT 100,
  p_is_published boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  city text,
  event_title text,
  venue text,
  ticket_url text,
  role_text text,
  selection_reasons text[],
  image_url text,
  photo_credit text,
  event_date text,
  event_time text,
  ticket_price text,
  sort_order integer,
  is_published boolean,
  like_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_valid boolean;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se highlight existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE id = p_highlight_id) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Atualizar o highlight
  UPDATE public.highlights SET
    city = p_city::city,
    event_title = p_event_title,
    venue = p_venue,
    ticket_url = NULLIF(p_ticket_url, ''),
    role_text = p_role_text,
    selection_reasons = COALESCE(p_selection_reasons, '{}'),
    image_url = p_image_url,
    photo_credit = NULLIF(p_photo_credit, ''),
    event_date = CASE WHEN p_event_date = '' THEN NULL ELSE p_event_date::date END,
    event_time = CASE WHEN p_event_time = '' THEN NULL ELSE p_event_time::time END,
    ticket_price = NULLIF(p_ticket_price, ''),
    sort_order = p_sort_order,
    is_published = p_is_published,
    updated_at = NOW()
  WHERE id = p_highlight_id;

  -- Retornar o highlight atualizado
  RETURN QUERY
  SELECT 
    h.id,
    h.city::text,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text::text,
    h.selection_reasons,
    h.image_url,
    h.photo_credit,
    h.event_date::text,
    h.event_time::text,
    h.ticket_price,
    h.sort_order,
    h.is_published,
    h.like_count,
    h.created_at,
    h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$$;

-- Recriar função para buscar highlight por ID
CREATE OR REPLACE FUNCTION admin_get_highlight_by_id(
  p_admin_email text,
  p_highlight_id uuid
)
RETURNS TABLE(
  id uuid,
  city text,
  event_title text,
  venue text,
  ticket_url text,
  role_text text,
  selection_reasons text[],
  image_url text,
  photo_credit text,
  event_date text,
  event_time text,
  ticket_price text,
  sort_order integer,
  is_published boolean,
  like_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_valid boolean;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Retornar o highlight
  RETURN QUERY
  SELECT 
    h.id,
    h.city::text,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text::text,
    h.selection_reasons,
    h.image_url,
    h.photo_credit,
    h.event_date::text,
    h.event_time::text,
    h.ticket_price,
    h.sort_order,
    h.is_published,
    h.like_count,
    h.created_at,
    h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$$;