-- Verificar e corrigir funções RPC para highlights
-- 1. Primeiro, vamos corrigir admin_get_highlight_by_id para usar is_admin_session_valid

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
BEGIN
  -- Usar validação padronizada
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se highlight existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE highlights.id = p_highlight_id) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
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
$function$;

-- 2. Criar/atualizar admin_create_highlight_v2
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
  p_event_date text,
  p_event_time text,
  p_ticket_price text,
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
  -- Validar admin
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Converter strings para tipos corretos, se fornecidos
  parsed_date := CASE 
    WHEN p_event_date IS NOT NULL AND p_event_date != '' THEN p_event_date::date 
    ELSE NULL 
  END;
  
  parsed_time := CASE 
    WHEN p_event_time IS NOT NULL AND p_event_time != '' THEN p_event_time::time 
    ELSE NULL 
  END;

  INSERT INTO public.highlights (
    city, event_title, venue, ticket_url, role_text, selection_reasons,
    image_url, photo_credit, event_date, event_time, ticket_price,
    sort_order, is_published
  ) VALUES (
    p_city, p_event_title, p_venue, p_ticket_url, p_role_text, p_selection_reasons,
    p_image_url, p_photo_credit, parsed_date, parsed_time, p_ticket_price,
    p_sort_order, p_is_published
  ) RETURNING highlights.id INTO new_highlight_id;

  RETURN QUERY
  SELECT 
    h.id, h.city, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE h.id = new_highlight_id;
END;
$function$;

-- 3. Criar/atualizar admin_update_highlight_v2
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
  p_event_date text,
  p_event_time text,
  p_ticket_price text,
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
  -- Validar admin
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se highlight existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE id = p_highlight_id) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Converter strings para tipos corretos, se fornecidos
  parsed_date := CASE 
    WHEN p_event_date IS NOT NULL AND p_event_date != '' THEN p_event_date::date 
    ELSE NULL 
  END;
  
  parsed_time := CASE 
    WHEN p_event_time IS NOT NULL AND p_event_time != '' THEN p_event_time::time 
    ELSE NULL 
  END;

  UPDATE public.highlights SET
    city = p_city,
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

  RETURN QUERY
  SELECT 
    h.id, h.city, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$function$;

-- 4. Função de debug para testar todo o fluxo
CREATE OR REPLACE FUNCTION public.debug_highlight_workflow(p_admin_email text, p_highlight_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_valid boolean;
  admin_in_approved boolean;
  admin_in_users boolean;
  highlight_exists boolean;
  highlight_data jsonb;
  result jsonb;
BEGIN
  -- Verificar validação de admin
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  -- Verificar se está na tabela approved_admins
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = p_admin_email AND is_active = true
  ) INTO admin_in_approved;
  
  -- Verificar se está na tabela admin_users
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  ) INTO admin_in_users;
  
  -- Se ID fornecido, verificar highlight
  IF p_highlight_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM public.highlights WHERE id = p_highlight_id) INTO highlight_exists;
    
    IF highlight_exists THEN
      SELECT to_jsonb(h.*) INTO highlight_data
      FROM public.highlights h
      WHERE h.id = p_highlight_id;
    END IF;
  END IF;
  
  result := jsonb_build_object(
    'admin_email', p_admin_email,
    'admin_valid', admin_valid,
    'admin_in_approved', admin_in_approved,
    'admin_in_users', admin_in_users,
    'highlight_id', p_highlight_id,
    'highlight_exists', highlight_exists,
    'highlight_data', highlight_data,
    'timestamp', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM,
    'admin_email', p_admin_email,
    'highlight_id', p_highlight_id
  );
END;
$function$;