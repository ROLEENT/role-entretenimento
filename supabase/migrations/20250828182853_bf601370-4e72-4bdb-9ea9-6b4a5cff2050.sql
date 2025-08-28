-- LIMPEZA RADICAL COMPLETA - Remover TODAS as funções highlight conflitantes
DROP FUNCTION IF EXISTS public.admin_create_highlight CASCADE;
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2 CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_highlight CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2 CASCADE;
DROP FUNCTION IF EXISTS public.admin_get_highlight_by_id CASCADE;
DROP FUNCTION IF EXISTS public.admin_get_highlight_by_id_v2 CASCADE;

-- RECRIAÇÃO ÚNICA E LIMPA - Versão v3 para evitar cache
CREATE OR REPLACE FUNCTION public.admin_create_highlight_v3(
  p_admin_email text,
  p_city text,
  p_event_title text,
  p_venue text,
  p_ticket_url text,
  p_role_text text,
  p_selection_reasons text[],
  p_image_url text,
  p_photo_credit text,
  p_event_date text,
  p_event_time text,
  p_ticket_price text,
  p_sort_order integer,
  p_is_published boolean
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
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Inserir novo highlight
  INSERT INTO public.highlights (
    city, event_title, venue, ticket_url, role_text, selection_reasons,
    image_url, photo_credit, event_date, event_time, ticket_price,
    sort_order, is_published
  ) VALUES (
    p_city::city, p_event_title, p_venue, NULLIF(p_ticket_url, ''), p_role_text, p_selection_reasons,
    p_image_url, NULLIF(p_photo_credit, ''), NULLIF(p_event_date, '')::date, NULLIF(p_event_time, '')::time,
    NULLIF(p_ticket_price, ''), p_sort_order, p_is_published
  ) RETURNING highlights.id INTO new_highlight_id;

  -- Retornar highlight criado
  RETURN QUERY
  SELECT 
    h.id,
    h.city::text,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text,
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

-- Função para atualizar highlight v3
CREATE OR REPLACE FUNCTION public.admin_update_highlight_v3(
  p_admin_email text,
  p_highlight_id uuid,
  p_city text,
  p_event_title text,
  p_venue text,
  p_ticket_url text,
  p_role_text text,
  p_selection_reasons text[],
  p_image_url text,
  p_photo_credit text,
  p_event_date text,
  p_event_time text,
  p_ticket_price text,
  p_sort_order integer,
  p_is_published boolean
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
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se highlight existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE highlights.id = p_highlight_id) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Atualizar highlight
  UPDATE public.highlights SET
    city = p_city::city,
    event_title = p_event_title,
    venue = p_venue,
    ticket_url = NULLIF(p_ticket_url, ''),
    role_text = p_role_text,
    selection_reasons = p_selection_reasons,
    image_url = p_image_url,
    photo_credit = NULLIF(p_photo_credit, ''),
    event_date = NULLIF(p_event_date, '')::date,
    event_time = NULLIF(p_event_time, '')::time,
    ticket_price = NULLIF(p_ticket_price, ''),
    sort_order = p_sort_order,
    is_published = p_is_published,
    updated_at = NOW()
  WHERE highlights.id = p_highlight_id;

  -- Retornar highlight atualizado
  RETURN QUERY
  SELECT 
    h.id,
    h.city::text,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text,
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

-- Função para buscar highlight por ID v3
CREATE OR REPLACE FUNCTION public.admin_get_highlight_by_id_v3(
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
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Retornar highlight
  RETURN QUERY
  SELECT 
    h.id,
    h.city::text,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text,
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