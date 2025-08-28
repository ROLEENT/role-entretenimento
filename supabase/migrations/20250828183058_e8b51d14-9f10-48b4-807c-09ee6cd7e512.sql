-- LIMPEZA ESPECÍFICA com assinaturas exatas para remover TODAS as versões
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2(text, city, text, text, text, character varying, text[], text, text, date, time without time zone, text, integer, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2(text, text, text, text, text, text, text[], text, text, text, text, text, integer, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2(text, uuid, city, text, text, text, character varying, text[], text, text, date, time without time zone, text, integer, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2(text, uuid, text, text, text, text, text, text[], text, text, text, text, text, integer, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.admin_get_highlight_by_id_v2(text, uuid) CASCADE;

-- Limpar qualquer outra variação que possa existir
DO $$
DECLARE
    func_name text;
BEGIN
    FOR func_name IN 
        SELECT n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')'
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname LIKE 'admin_%highlight%'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_name || ' CASCADE';
    END LOOP;
END $$;

-- CRIAR FUNÇÕES V3 ÚNICAS E LIMPAS
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
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_highlight_id uuid;
  admin_valid boolean;
  result jsonb;
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
  ) RETURNING id INTO new_highlight_id;

  -- Retornar resultado como JSON
  SELECT jsonb_build_object(
    'id', h.id,
    'city', h.city::text,
    'event_title', h.event_title,
    'venue', h.venue,
    'ticket_url', h.ticket_url,
    'role_text', h.role_text,
    'selection_reasons', h.selection_reasons,
    'image_url', h.image_url,
    'photo_credit', h.photo_credit,
    'event_date', h.event_date::text,
    'event_time', h.event_time::text,
    'ticket_price', h.ticket_price,
    'sort_order', h.sort_order,
    'is_published', h.is_published,
    'like_count', h.like_count,
    'created_at', h.created_at,
    'updated_at', h.updated_at
  ) INTO result
  FROM public.highlights h
  WHERE h.id = new_highlight_id;

  RETURN result;
END;
$$;

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
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_valid boolean;
  result jsonb;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se highlight existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE id = p_highlight_id) THEN
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
  WHERE id = p_highlight_id;

  -- Retornar resultado como JSON
  SELECT jsonb_build_object(
    'id', h.id,
    'city', h.city::text,
    'event_title', h.event_title,
    'venue', h.venue,
    'ticket_url', h.ticket_url,
    'role_text', h.role_text,
    'selection_reasons', h.selection_reasons,
    'image_url', h.image_url,
    'photo_credit', h.photo_credit,
    'event_date', h.event_date::text,
    'event_time', h.event_time::text,
    'ticket_price', h.ticket_price,
    'sort_order', h.sort_order,
    'is_published', h.is_published,
    'like_count', h.like_count,
    'created_at', h.created_at,
    'updated_at', h.updated_at
  ) INTO result
  FROM public.highlights h
  WHERE h.id = p_highlight_id;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_highlight_by_id_v3(
  p_admin_email text,
  p_highlight_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_valid boolean;
  result jsonb;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Retornar highlight como JSON
  SELECT jsonb_build_object(
    'id', h.id,
    'city', h.city::text,
    'event_title', h.event_title,
    'venue', h.venue,
    'ticket_url', h.ticket_url,
    'role_text', h.role_text,
    'selection_reasons', h.selection_reasons,
    'image_url', h.image_url,
    'photo_credit', h.photo_credit,
    'event_date', h.event_date::text,
    'event_time', h.event_time::text,
    'ticket_price', h.ticket_price,
    'sort_order', h.sort_order,
    'is_published', h.is_published,
    'like_count', h.like_count,
    'created_at', h.created_at,
    'updated_at', h.updated_at
  ) INTO result
  FROM public.highlights h
  WHERE h.id = p_highlight_id;

  RETURN result;
END;
$$;