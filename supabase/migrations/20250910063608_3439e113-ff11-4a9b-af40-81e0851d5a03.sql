-- Identificar e corrigir Security Definer Views críticas

-- 1. Verificar views existentes
SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public';

-- 2. Corrigir funções restantes sem search_path
ALTER FUNCTION public.fn_slugify(text) SET search_path = 'public';
ALTER FUNCTION public.recalc_event_curation_score(uuid) SET search_path = 'public';
ALTER FUNCTION public.trg_ecc_recalc() SET search_path = 'public';
ALTER FUNCTION public.sync_organizer_to_entity_profile() SET search_path = 'public';
ALTER FUNCTION public.sync_artist_to_entity_profile() SET search_path = 'public';
ALTER FUNCTION public.create_activity(uuid, uuid, text, text, uuid, jsonb) SET search_path = 'public';
ALTER FUNCTION public.toggle_follow(text, uuid, text) SET search_path = 'public';
ALTER FUNCTION public.get_event_social(uuid, integer) SET search_path = 'public';

-- 3. Função para monitoramento de segurança
CREATE OR REPLACE FUNCTION public.security_monitor()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  admin_logins_last_hour integer;
  recent_errors integer;
BEGIN
  -- Contar logins de admin na última hora
  SELECT COUNT(*) INTO admin_logins_last_hour
  FROM public.security_log
  WHERE event_type = 'admin_access_check'
  AND created_at > NOW() - INTERVAL '1 hour'
  AND event_data->>'result' = 'true';
  
  -- Contar erros recentes
  SELECT COUNT(*) INTO recent_errors
  FROM public.security_log
  WHERE severity IN ('critical', 'high')
  AND created_at > NOW() - INTERVAL '1 hour';
  
  result := jsonb_build_object(
    'admin_logins_last_hour', admin_logins_last_hour,
    'recent_errors', recent_errors,
    'last_check', NOW(),
    'status', CASE 
      WHEN recent_errors > 5 THEN 'critical'
      WHEN recent_errors > 0 THEN 'warning'
      ELSE 'ok'
    END
  );
  
  RETURN result;
END;
$$;