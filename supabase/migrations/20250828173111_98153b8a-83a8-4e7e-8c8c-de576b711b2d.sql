-- Remover funções duplicadas e conflitantes
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2(text, city, text, text, text, character varying, text[], text, text, date, time without time zone, text, integer, boolean);
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2(text, uuid, city, text, text, text, character varying, text[], text, text, date, time without time zone, text, integer, boolean);

-- Criar funções corretas com tipos adequados
CREATE OR REPLACE FUNCTION public.admin_create_highlight_v2(
  p_admin_email text,
  p_city text, -- Mudando de enum para text para compatibilidade
  p_event_title text,
  p_venue text,
  p_ticket_url text DEFAULT NULL,
  p_role_text text,
  p_selection_reasons text[] DEFAULT '{}',
  p_image_url text,
  p_photo_credit text DEFAULT NULL,
  p_event_date text DEFAULT NULL, -- Mudando para text para compatibilidade
  p_event_time text DEFAULT NULL, -- Mudando para text para compatibilidade
  p_ticket_price text DEFAULT NULL,
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
AS $function$
DECLARE
  new_highlight_id uuid;
  parsed_date date;
  parsed_time time without time zone;
BEGIN
  -- Verificar se admin é válido
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Converter date string para date (se fornecido)
  IF p_event_date IS NOT NULL AND p_event_date != '' THEN
    parsed_date := p_event_date::date;
  END IF;

  -- Converter time string para time (se fornecido)
  IF p_event_time IS NOT NULL AND p_event_time != '' THEN
    parsed_time := p_event_time::time;
  END IF;

  -- Inserir o destaque
  INSERT INTO public.highlights (
    city, event_title, venue, ticket_url, role_text, selection_reasons,
    image_url, photo_credit, event_date, event_time, ticket_price,
    sort_order, is_published
  ) VALUES (
    p_city::city, p_event_title, p_venue, NULLIF(p_ticket_url, ''), p_role_text, 
    COALESCE(p_selection_reasons, '{}'), p_image_url, NULLIF(p_photo_credit, ''),
    parsed_date, parsed_time, NULLIF(p_ticket_price, ''),
    p_sort_order, p_is_published
  ) RETURNING highlights.id INTO new_highlight_id;

  -- Retornar o destaque criado
  RETURN QUERY
  SELECT 
    h.id, h.city::text, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE h.id = new_highlight_id;
END;
$function$;

-- Função de atualização
CREATE OR REPLACE FUNCTION public.admin_update_highlight_v2(
  p_admin_email text,
  p_highlight_id uuid,
  p_city text,
  p_event_title text,
  p_venue text,
  p_ticket_url text DEFAULT NULL,
  p_role_text text,
  p_selection_reasons text[] DEFAULT '{}',
  p_image_url text,
  p_photo_credit text DEFAULT NULL,
  p_event_date text DEFAULT NULL,
  p_event_time text DEFAULT NULL,
  p_ticket_price text DEFAULT NULL,
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
AS $function$
DECLARE
  parsed_date date;
  parsed_time time without time zone;
BEGIN
  -- Verificar se admin é válido
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se destaque existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE id = p_highlight_id) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Converter date string para date (se fornecido)
  IF p_event_date IS NOT NULL AND p_event_date != '' THEN
    parsed_date := p_event_date::date;
  END IF;

  -- Converter time string para time (se fornecido)
  IF p_event_time IS NOT NULL AND p_event_time != '' THEN
    parsed_time := p_event_time::time;
  END IF;

  -- Atualizar o destaque
  UPDATE public.highlights SET
    city = p_city::city,
    event_title = p_event_title,
    venue = p_venue,
    ticket_url = NULLIF(p_ticket_url, ''),
    role_text = p_role_text,
    selection_reasons = COALESCE(p_selection_reasons, '{}'),
    image_url = p_image_url,
    photo_credit = NULLIF(p_photo_credit, ''),
    event_date = parsed_date,
    event_time = parsed_time,
    ticket_price = NULLIF(p_ticket_price, ''),
    sort_order = p_sort_order,
    is_published = p_is_published,
    updated_at = NOW()
  WHERE id = p_highlight_id;

  -- Retornar o destaque atualizado
  RETURN QUERY
  SELECT 
    h.id, h.city::text, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$function$;