-- CORREÇÕES CRÍTICAS DE SEGURANÇA SUPABASE - VERSÃO CORRIGIDA

-- 1. Primeiro, remover políticas que dependem de funções que precisam ser atualizadas
DROP POLICY IF EXISTS "Admins can manage approved admins safely" ON public.approved_admins;

-- 2. Atualizar função validate_admin_email com search_path
DROP FUNCTION IF EXISTS public.validate_admin_email(text) CASCADE;
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE approved_admins.email = email_param AND is_active = true
  )
$function$;

-- 3. Recriar a política com a função corrigida
CREATE POLICY "Admins can manage approved admins safely" ON public.approved_admins
  FOR ALL USING (validate_admin_email(auth.email()));

-- 4. Atualizar outras funções críticas com search_path
-- Função admin_create_highlight_v2 corrigida
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2(text, city, text, text, text, character varying, text[], text, text, date, time without time zone, text, integer, boolean) CASCADE;

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

  -- Retornar o highlight criado
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

-- 5. Atualizar função admin_update_highlight_v2 com search_path
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2(text, uuid, city, text, text, text, character varying, text[], text, text, date, time without time zone, text, integer, boolean) CASCADE;

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
  admin_valid boolean;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  IF NOT admin_valid THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se highlight existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE highlights.id = p_highlight_id) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Atualizar highlight
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
  WHERE highlights.id = p_highlight_id;

  -- Retornar highlight atualizado
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