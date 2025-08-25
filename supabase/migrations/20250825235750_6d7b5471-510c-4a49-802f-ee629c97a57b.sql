-- Fase 2: Adicionar search_path às funções restantes para segurança

-- Função 1: add_blog_comment_secure 
CREATE OR REPLACE FUNCTION public.add_blog_comment_secure(p_post_id uuid, p_author_name text, p_author_email text, p_content text, p_parent_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_comment_id uuid;
BEGIN
  -- Insert comment
  INSERT INTO public.blog_comments (
    post_id, author_name, author_email, content, parent_id, is_approved
  )
  VALUES (
    p_post_id, p_author_name, p_author_email, p_content, p_parent_id, true
  )
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$function$;

-- Função 2: admin_create_highlight_v2
CREATE OR REPLACE FUNCTION public.admin_create_highlight_v2(p_admin_email text, p_city city, p_event_title text, p_venue text, p_ticket_url text, p_role_text character varying, p_selection_reasons text[], p_image_url text, p_photo_credit text, p_event_date date, p_event_time time without time zone, p_ticket_price text, p_sort_order integer, p_is_published boolean)
RETURNS TABLE(id uuid, city city, event_title text, venue text, ticket_url text, role_text character varying, selection_reasons text[], image_url text, photo_credit text, event_date date, event_time time without time zone, ticket_price text, sort_order integer, is_published boolean, like_count integer, created_at timestamp with time zone, updated_at timestamp with time zone)
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
    p_image_url, p_photo_credit, p_event_date,
    p_event_time, p_ticket_price, p_sort_order,
    p_is_published
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

-- Função 3: auto_approve_blog_comments
CREATE OR REPLACE FUNCTION public.auto_approve_blog_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-approve all new blog comments
  NEW.is_approved = true;
  RETURN NEW;
END;
$function$;

-- Função 4: award_checkin_points
CREATE OR REPLACE FUNCTION public.award_checkin_points()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.add_user_points(
    NEW.user_id,
    10,
    'checkin',
    NEW.event_id,
    'Check-in em evento'
  );
  
  PERFORM public.check_and_award_badges(NEW.user_id);
  
  RETURN NEW;
END;
$function$;

-- Função 5: award_review_points 
CREATE OR REPLACE FUNCTION public.award_review_points()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.add_user_points(
    NEW.user_id,
    15,
    'review',
    NEW.event_id,
    'Avaliação de evento'
  );
  
  PERFORM public.check_and_award_badges(NEW.user_id);
  
  RETURN NEW;
END;
$function$;

-- Função 6: update_calendar_updated_at
CREATE OR REPLACE FUNCTION public.update_calendar_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função 7: update_highlight_reviews_updated_at
CREATE OR REPLACE FUNCTION public.update_highlight_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função 8: update_gamification_updated_at
CREATE OR REPLACE FUNCTION public.update_gamification_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função 9: update_music_updated_at_column
CREATE OR REPLACE FUNCTION public.update_music_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;