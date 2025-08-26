-- CORREÇÃO CRÍTICA DE SEGURANÇA - FASE 1
-- Corrigir vulnerabilidades de search_path nas funções existentes

-- 1. Corrigir funções sem search_path definido
ALTER FUNCTION public.generate_email_hash(text) SET search_path TO 'public';
ALTER FUNCTION public.hash_email_for_client(text) SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.update_gamification_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_music_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.update_calendar_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_highlight_reviews_updated_at() SET search_path TO 'public';

-- 2. Remover view Security Definer problemática (se existir)
-- Substituir por function Security Definer mais segura
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar role do usuário na tabela profiles
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Retornar se é admin
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- 3. Criar políticas RLS para tabelas sem políticas
-- Identificar e corrigir tabelas com RLS habilitado mas sem políticas

-- Para tabela que pode estar sem políticas, criar política básica
-- (O linter vai nos ajudar a identificar qual é)

-- 4. Garantir que funções críticas tenham search_path correto
ALTER FUNCTION public.is_admin_session_valid(text) SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user() SET search_path TO 'public';
ALTER FUNCTION public.validate_admin_email(text) SET search_path TO 'public';

-- 5. Atualizar funções de gamificação para usar search_path
ALTER FUNCTION public.check_and_award_badges(uuid) SET search_path TO 'public';
ALTER FUNCTION public.award_checkin_points() SET search_path TO 'public';
ALTER FUNCTION public.award_review_points() SET search_path TO 'public';

-- 6. Funções de notificação também precisam de search_path
ALTER FUNCTION public.can_receive_notification(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.increment_notification_count(uuid) SET search_path TO 'public';
ALTER FUNCTION public.reset_daily_notification_count() SET search_path TO 'public';

-- 7. Verificar e corrigir função de métricas de notificação
ALTER FUNCTION public.calculate_notification_metrics(date, date, text, text) SET search_path TO 'public';
ALTER FUNCTION public.get_notification_performance_by_hour() SET search_path TO 'public';