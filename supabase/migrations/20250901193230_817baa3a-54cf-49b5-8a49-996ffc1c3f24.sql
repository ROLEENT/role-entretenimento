-- Correções RLS seguras - versão corrigida (sem tocar no admin)

-- 1. Recriar views Security Definer problemáticas (apenas não-admin)
DROP VIEW IF EXISTS public.agenda_public CASCADE;
DROP VIEW IF EXISTS public.analytics_summary CASCADE;

-- 2. Recriar agenda_public sem Security Definer
CREATE VIEW public.agenda_public AS
SELECT 
  ai.id,
  ai.title,
  ai.subtitle, 
  ai.summary,
  ai.slug,
  ai.status,
  ai.visibility_type,
  ai.starts_at,
  ai.end_at,
  ai.city,
  ai.address,
  ai.location_name,
  ai.neighborhood,
  ai.price_min,
  ai.price_max,
  ai.currency,
  ai.ticket_url,
  ai.cover_url,
  ai.alt_text,
  ai.focal_point_x,
  ai.focal_point_y,
  ai.tags,
  ai.type,
  ai.age_rating,
  ai.meta_title,
  ai.meta_description,
  ai.canonical_url,
  ai.noindex,
  ai.priority,
  ai.patrocinado,
  ai.anunciante,
  ai.cupom,
  ai.event_id,
  ai.venue_id,
  ai.organizer_id,
  ai.created_at,
  ai.updated_at,
  ai.publish_at,
  ai.unpublish_at,
  ai.deleted_at,
  ai.preview_token,
  ai.created_by,
  ai.updated_by
FROM public.agenda_itens ai
WHERE ai.status = 'published'::agenda_status 
  AND ai.deleted_at IS NULL
  AND (ai.publish_at IS NULL OR ai.publish_at <= NOW())
  AND (ai.unpublish_at IS NULL OR ai.unpublish_at > NOW());

-- 3. Recriar analytics_summary sem Security Definer
CREATE VIEW public.analytics_summary AS  
SELECT 
  DATE(ae.created_at) as date,
  ae.event_name,
  ae.source,
  ae.city,
  COUNT(*) as event_count,
  COUNT(DISTINCT ae.session_id) as unique_sessions,
  COUNT(DISTINCT ae.user_id) as unique_users
FROM public.analytics_events ae
WHERE ae.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ae.created_at), ae.event_name, ae.source, ae.city
ORDER BY date DESC;

-- 4. Adicionar SET search_path em functions públicas (não-admin)
CREATE OR REPLACE FUNCTION public.slugify(inp text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = 'public'
AS $$
  select lower(
           regexp_replace(
             regexp_replace(unaccent(coalesce($1,'')), '[^a-zA-Z0-9]+', '-', 'g'),
             '(^-|-$)', '', 'g'
           )
         )
$$;

CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT md5(lower(trim(email_text)));
$$;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar following_count do seguidor
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Incrementar followers_count do seguido
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar following_count do seguidor
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    
    -- Decrementar followers_count do seguido
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_highlight_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE highlights 
    SET like_count = like_count + 1 
    WHERE id = NEW.highlight_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE highlights 
    SET like_count = GREATEST(0, like_count - 1) 
    WHERE id = OLD.highlight_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;