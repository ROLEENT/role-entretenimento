-- Corrigir funções sem search_path (7 funções identificadas no linter)

-- 1. Corrigir função update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Corrigir função check_and_award_badges (se existir)
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_points integer;
  badge_record record;
BEGIN
  -- Buscar pontos totais do usuário
  SELECT COALESCE(total_points, 0) INTO user_points
  FROM public.user_points 
  WHERE user_id = p_user_id;
  
  -- Verificar badges que o usuário pode ganhar
  FOR badge_record IN 
    SELECT id, points_required 
    FROM public.badges 
    WHERE is_active = true 
    AND points_required <= user_points
    AND id NOT IN (
      SELECT badge_id FROM public.user_badges 
      WHERE user_id = p_user_id
    )
  LOOP
    -- Conceder badge
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (p_user_id, badge_record.id);
  END LOOP;
END;
$function$;

-- 3. Criar função para verificar se usuário é editor ou admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
END;
$function$;

-- 4. Criar função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.auth_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT role::text FROM public.user_profiles WHERE user_id = auth.uid()),
    'viewer'
  );
END;
$function$;

-- 5. Corrigir função agenda_scheduler (se existir)
CREATE OR REPLACE FUNCTION public.agenda_scheduler()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Agendar publicação de eventos com publish_at <= now()
  UPDATE public.agenda_itens 
  SET 
    status = 'published'::agenda_status,
    published_at = now(),
    is_published = true
  WHERE publish_at <= now() 
    AND status = 'scheduled'::agenda_status
    AND deleted_at IS NULL;
    
  -- Despublicar eventos com unpublish_at <= now()
  UPDATE public.agenda_itens 
  SET 
    status = 'draft'::agenda_status,
    is_published = false
  WHERE unpublish_at <= now() 
    AND status = 'published'::agenda_status
    AND deleted_at IS NULL;
END;
$function$;