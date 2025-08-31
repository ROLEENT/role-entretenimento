-- Fix functions with mutable search_path by setting search_path to 'public'
-- This addresses the 23 WARN issues about Function Search Path Mutable

-- Fix admin_delete_venue function
CREATE OR REPLACE FUNCTION public.admin_delete_venue(p_venue_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin/editor necessária';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.venues WHERE id = p_venue_id) THEN
    RAISE EXCEPTION 'Local não encontrado';
  END IF;

  DELETE FROM public.venues WHERE id = p_venue_id;
  RETURN TRUE;
END;
$function$;

-- Fix increment_highlight_likes function
CREATE OR REPLACE FUNCTION public.increment_highlight_likes(highlight_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    UPDATE highlights 
    SET like_count = like_count + 1 
    WHERE id = highlight_id;
END;
$function$;

-- Fix get_highlight_like_count function
CREATE OR REPLACE FUNCTION public.get_highlight_like_count(p_highlight_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COUNT(*)::integer
  FROM public.highlight_likes
  WHERE highlight_id = p_highlight_id;
$function$;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$function$;

-- Fix ensure_single_current_metric function
CREATE OR REPLACE FUNCTION public.ensure_single_current_metric()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.is_current THEN
    UPDATE public.site_metrics SET is_current = false WHERE id <> NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END
$function$;

-- Fix increment_post_views function
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.blog_posts 
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id;
END;
$function$;

-- Fix validate_highlight_dates function
CREATE OR REPLACE FUNCTION public.validate_highlight_dates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
begin
  if new.end_at is not null and new.start_at is not null then
    if new.end_at <= new.start_at + interval '15 minutes' then
      raise exception 'A data de fim deve ser pelo menos 15 minutos após o início';
    end if;
  end if;
  return new;
end;
$function$;

-- Fix can_edit_highlight function
CREATE OR REPLACE FUNCTION public.can_edit_highlight(highlight_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.highlights h ON h.id = highlight_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR 
      (p.role = 'editor' AND (h.created_by = auth.uid() OR h.created_by IS NULL))
    )
  );
$function$;

-- Fix can_publish_highlight function
CREATE OR REPLACE FUNCTION public.can_publish_highlight()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  );
$function$;

-- Fix can_delete_highlight function
CREATE OR REPLACE FUNCTION public.can_delete_highlight()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;