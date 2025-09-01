-- Continue fixing remaining functions with search_path issues
-- Fix the next batch of functions to add SET search_path = 'public'

-- Fix add_blog_comment_secure_hash function
CREATE OR REPLACE FUNCTION public.add_blog_comment_secure_hash(p_post_id uuid, p_author_name text, p_email_hash text, p_content text, p_parent_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  new_comment_id uuid;
BEGIN
  -- Insert comment with email hash
  INSERT INTO public.blog_comments (
    post_id, author_name, email_hash, content, parent_id, is_approved
  )
  VALUES (
    p_post_id, p_author_name, p_email_hash, p_content, p_parent_id, true
  )
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$function$;

-- Fix validate_username function
CREATE OR REPLACE FUNCTION public.validate_username(new_username text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se username tem formato válido (apenas letras, números e underscore)
  IF new_username !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN false;
  END IF;
  
  -- Verificar tamanho (3-30 caracteres)
  IF length(new_username) < 3 OR length(new_username) > 30 THEN
    RETURN false;
  END IF;
  
  -- Verificar se não está em uso
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix generate_email_hash function
CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT md5(lower(trim(email_text)));
$function$;

-- Fix is_current_admin function
CREATE OR REPLACE FUNCTION public.is_current_admin(session_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  )
$function$;

-- Fix update_group_event_participants_count function
CREATE OR REPLACE FUNCTION public.update_group_event_participants_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.group_events 
    SET current_participants_count = current_participants_count + 1 
    WHERE id = NEW.group_event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.group_events 
    SET current_participants_count = current_participants_count - 1 
    WHERE id = OLD.group_event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix create_notification function
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix mark_notification_read function
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$function$;

-- Fix mark_all_notifications_read function
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE user_id = auth.uid() AND read = false;
END;
$function$;

-- Fix update_gamification_updated_at function
CREATE OR REPLACE FUNCTION public.update_gamification_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;