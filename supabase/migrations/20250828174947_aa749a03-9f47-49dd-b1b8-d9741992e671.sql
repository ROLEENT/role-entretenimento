-- Corrigir tipos de retorno das funções admin_create_highlight_v2 e admin_update_highlight_v2

-- Recriar admin_create_highlight_v2 com tipos corretos
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2(text, text, text, text, text, text, text[], text, text, text, text, text, integer, boolean);

CREATE OR REPLACE FUNCTION public.admin_create_highlight_v2(
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
  city city,
  event_title text,
  venue text,
  ticket_url text,
  role_text character varying,
  selection_reasons text[],
  image_url text,
  photo_credit text,
  event_date date,
  event_time time without time zone,
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
  parsed_date date := NULL;
  parsed_time time := NULL;
BEGIN
  -- Verificar se admin é válido
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Validações obrigatórias
  IF p_city IS NULL OR length(trim(p_city)) = 0 THEN
    RAISE EXCEPTION 'Cidade é obrigatória';
  END IF;
  
  IF p_event_title IS NULL OR length(trim(p_event_title)) = 0 THEN
    RAISE EXCEPTION 'Título do evento é obrigatório';
  END IF;
  
  IF p_venue IS NULL OR length(trim(p_venue)) = 0 THEN
    RAISE EXCEPTION 'Local é obrigatório';
  END IF;

  -- Conversão de data e hora
  IF p_event_date IS NOT NULL AND length(trim(p_event_date)) > 0 THEN
    BEGIN
      parsed_date := p_event_date::date;
    EXCEPTION WHEN OTHERS THEN
      parsed_date := NULL;
    END;
  END IF;

  IF p_event_time IS NOT NULL AND length(trim(p_event_time)) > 0 THEN
    BEGIN
      parsed_time := p_event_time::time;
    EXCEPTION WHEN OTHERS THEN
      parsed_time := NULL;
    END;
  END IF;

  -- Inserir destaque
  INSERT INTO public.highlights (
    city, event_title, venue, ticket_url, role_text, selection_reasons,
    image_url, photo_credit, event_date, event_time, ticket_price,
    sort_order, is_published
  ) VALUES (
    p_city::city, p_event_title, p_venue, p_ticket_url, p_role_text, p_selection_reasons,
    p_image_url, p_photo_credit, parsed_date, parsed_time, p_ticket_price,
    p_sort_order, p_is_published
  ) RETURNING highlights.id INTO new_highlight_id;

  -- Retornar destaque criado
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

-- Recriar admin_update_highlight_v2 com tipos corretos
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2(text, uuid, text, text, text, text, text, text, text[], text, text, text, text, text, integer, boolean);

CREATE OR REPLACE FUNCTION public.admin_update_highlight_v2(
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
  city city,
  event_title text,
  venue text,
  ticket_url text,
  role_text character varying,
  selection_reasons text[],
  image_url text,
  photo_credit text,
  event_date date,
  event_time time without time zone,
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
  parsed_date date := NULL;
  parsed_time time := NULL;
BEGIN
  -- Verificar se admin é válido
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se destaque existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE id = p_highlight_id) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Conversão de data e hora
  IF p_event_date IS NOT NULL AND length(trim(p_event_date)) > 0 THEN
    BEGIN
      parsed_date := p_event_date::date;
    EXCEPTION WHEN OTHERS THEN
      parsed_date := NULL;
    END;
  END IF;

  IF p_event_time IS NOT NULL AND length(trim(p_event_time)) > 0 THEN
    BEGIN
      parsed_time := p_event_time::time;
    EXCEPTION WHEN OTHERS THEN
      parsed_time := NULL;
    END;
  END IF;

  -- Atualizar destaque
  UPDATE public.highlights SET
    city = p_city::city,
    event_title = p_event_title,
    venue = p_venue,
    ticket_url = p_ticket_url,
    role_text = p_role_text,
    selection_reasons = p_selection_reasons,
    image_url = p_image_url,
    photo_credit = p_photo_credit,
    event_date = parsed_date,
    event_time = parsed_time,
    ticket_price = p_ticket_price,
    sort_order = p_sort_order,
    is_published = p_is_published,
    updated_at = NOW()
  WHERE id = p_highlight_id;

  -- Retornar destaque atualizado
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

-- Recriar admin_get_highlight_by_id com tipos corretos
DROP FUNCTION IF EXISTS public.admin_get_highlight_by_id(text, uuid);

CREATE OR REPLACE FUNCTION public.admin_get_highlight_by_id(
  p_admin_email text,
  p_highlight_id uuid
)
RETURNS TABLE(
  id uuid,
  city city,
  event_title text,
  venue text,
  ticket_url text,
  role_text character varying,
  selection_reasons text[],
  image_url text,
  photo_credit text,
  event_date date,
  event_time time without time zone,
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
BEGIN
  -- Verificar se admin é válido
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

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