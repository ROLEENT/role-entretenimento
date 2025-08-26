-- Fase 3: Corrigir Security Definer Views e funções restantes

-- Primeiro, vamos verificar se existem views com SECURITY DEFINER
-- e remover ou corrigir conforme necessário

-- Identificar e corrigir todas as funções que ainda não têm search_path
-- Verificar se há alguma view problemática que precise ser corrigida

-- Adicionar search_path a funções restantes que podem ter sido perdidas
CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_group_members_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups 
    SET current_members_count = current_members_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups 
    SET current_members_count = current_members_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_group_event_participants_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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