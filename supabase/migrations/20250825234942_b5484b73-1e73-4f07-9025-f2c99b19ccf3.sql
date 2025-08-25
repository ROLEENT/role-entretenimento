-- CORREÇÕES CRÍTICAS DE SEGURANÇA SUPABASE

-- 1. Remover SECURITY DEFINER das views problemáticas
-- Corrigir view blog_comments_safe removendo SECURITY DEFINER
DROP VIEW IF EXISTS public.blog_comments_safe;

CREATE VIEW public.blog_comments_safe AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  created_at,
  parent_id,
  is_approved
FROM public.blog_comments 
WHERE is_approved = true;

-- 2. Adicionar search_path para funções sem definição
-- Função is_admin_session_valid
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  )
$function$;

-- Função is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_email text;
BEGIN
  -- Tentar obter email do contexto da requisição
  session_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  -- Se não encontrou no header, retorna false
  IF session_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se admin existe e está ativo
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
END;
$function$;

-- Função validate_admin_email
CREATE OR REPLACE FUNCTION public.validate_admin_email(email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE approved_admins.email = validate_admin_email.email AND is_active = true
  )
$function$;

-- Função add_blog_comment_secure
CREATE OR REPLACE FUNCTION public.add_blog_comment_secure(
  p_post_id uuid,
  p_author_name text,
  p_author_email text,
  p_content text,
  p_parent_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  comment_id uuid;
BEGIN
  INSERT INTO public.blog_comments (
    post_id,
    author_name,
    author_email,
    content,
    parent_id,
    is_approved
  ) VALUES (
    p_post_id,
    p_author_name,
    p_author_email,
    p_content,
    p_parent_id,
    true  -- Auto-approve comments
  ) RETURNING id INTO comment_id;
  
  RETURN comment_id;
END;
$function$;

-- 3. Configurar extensões fora do schema public
-- Mover extensão uuid-ossp para schema extensions se existir
DO $$
BEGIN
  -- Verificar se extensão existe no public e mover para extensions
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
END
$$;

-- 4. Melhorar RLS para blog_comments para proteger emails
-- Criar função para verificar se é admin ou owner do comentário
CREATE OR REPLACE FUNCTION public.can_view_comment_email(comment_author_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    CASE 
      WHEN auth.jwt() ->> 'email' = comment_author_email THEN true
      WHEN is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) THEN true
      ELSE false
    END
$function$;

-- Atualizar políticas RLS para blog_comments
DROP POLICY IF EXISTS "Admin only access to blog_comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can manage comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.blog_comments;

-- Nova política: apenas admins podem ver emails completos
CREATE POLICY "Admins can view all comment data" ON public.blog_comments
  FOR SELECT USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- Nova política: qualquer um pode inserir comentários  
CREATE POLICY "Anyone can insert comments" ON public.blog_comments
  FOR INSERT WITH CHECK (true);

-- Nova política: admins podem atualizar/deletar
CREATE POLICY "Admins can manage comments" ON public.blog_comments
  FOR ALL USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- 5. Corrigir função admin_create_highlight_v2 que estava truncada
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

-- 6. Adicionar search_path para admin_update_highlight_v2
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