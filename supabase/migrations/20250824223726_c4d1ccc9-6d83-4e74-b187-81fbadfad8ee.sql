-- Criar funções RPC para operações admin de highlights
CREATE OR REPLACE FUNCTION public.admin_get_highlights(p_admin_email text, p_city text DEFAULT NULL, p_search text DEFAULT NULL)
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
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Retornar highlights com filtros opcionais
  RETURN QUERY
  SELECT 
    h.id,
    h.city,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text,
    h.selection_reasons,
    h.image_url,
    h.photo_credit,
    h.event_date,
    h.sort_order,
    h.is_published,
    h.like_count,
    h.created_at,
    h.updated_at
  FROM public.highlights h
  WHERE 
    (p_city IS NULL OR h.city::text = p_city)
    AND (p_search IS NULL OR h.event_title ILIKE '%' || p_search || '%')
  ORDER BY h.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_highlight_by_id(p_admin_email text, p_highlight_id uuid)
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
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Retornar highlight específico
  RETURN QUERY
  SELECT 
    h.id,
    h.city,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text,
    h.selection_reasons,
    h.image_url,
    h.photo_credit,
    h.event_date,
    h.sort_order,
    h.is_published,
    h.like_count,
    h.created_at,
    h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_highlight(
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
  p_sort_order integer,
  p_is_published boolean
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
BEGIN
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Inserir novo highlight
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
    sort_order,
    is_published
  ) VALUES (
    p_city,
    p_event_title,
    p_venue,
    p_ticket_url,
    p_role_text,
    p_selection_reasons,
    p_image_url,
    p_photo_credit,
    p_event_date,
    p_sort_order,
    p_is_published
  ) RETURNING highlights.id INTO new_highlight_id;

  -- Retornar o highlight criado
  RETURN QUERY
  SELECT 
    h.id,
    h.city,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text,
    h.selection_reasons,
    h.image_url,
    h.photo_credit,
    h.event_date,
    h.sort_order,
    h.is_published,
    h.like_count,
    h.created_at,
    h.updated_at
  FROM public.highlights h
  WHERE h.id = new_highlight_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_highlight(
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
  p_sort_order integer,
  p_is_published boolean
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
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se o highlight existe
  IF NOT EXISTS (
    SELECT 1 FROM public.highlights WHERE id = p_highlight_id
  ) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Atualizar o highlight
  UPDATE public.highlights SET
    city = p_city,
    event_title = p_event_title,
    venue = p_venue,
    ticket_url = p_ticket_url,
    role_text = p_role_text,
    selection_reasons = p_selection_reasons,
    image_url = p_image_url,
    photo_credit = p_photo_credit,
    event_date = p_event_date,
    sort_order = p_sort_order,
    is_published = p_is_published,
    updated_at = NOW()
  WHERE id = p_highlight_id;

  -- Retornar o highlight atualizado
  RETURN QUERY
  SELECT 
    h.id,
    h.city,
    h.event_title,
    h.venue,
    h.ticket_url,
    h.role_text,
    h.selection_reasons,
    h.image_url,
    h.photo_credit,
    h.event_date,
    h.sort_order,
    h.is_published,
    h.like_count,
    h.created_at,
    h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_highlight(p_admin_email text, p_highlight_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se o highlight existe
  IF NOT EXISTS (
    SELECT 1 FROM public.highlights WHERE id = p_highlight_id
  ) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Deletar o highlight
  DELETE FROM public.highlights WHERE id = p_highlight_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_toggle_highlight_published(p_admin_email text, p_highlight_id uuid, p_is_published boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se o admin existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se o highlight existe
  IF NOT EXISTS (
    SELECT 1 FROM public.highlights WHERE id = p_highlight_id
  ) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Atualizar status de publicação
  UPDATE public.highlights SET
    is_published = p_is_published,
    updated_at = NOW()
  WHERE id = p_highlight_id;

  RETURN true;
END;
$$;