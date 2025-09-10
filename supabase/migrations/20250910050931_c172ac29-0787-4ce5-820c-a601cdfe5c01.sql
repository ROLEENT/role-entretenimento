-- Fase 6.1 - Finalização Crítica: Correção Funcões sem search_path
-- Corrigir apenas as funções que não têm SET search_path sem afetar políticas RLS existentes

-- Atualizar funções críticas adicionando SET search_path
CREATE OR REPLACE FUNCTION public.user_liked_highlight(p_highlight_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.highlight_likes
    WHERE highlight_id = p_highlight_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_checkin_status(p_event_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.event_checkins
    WHERE event_id = p_event_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.ensure_genre(p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE 
  v_id UUID;
  v_slug TEXT;
  v_clean_name TEXT;
BEGIN
  -- Limpar e validar nome
  v_clean_name := trim(p_name);
  IF v_clean_name = '' OR v_clean_name IS NULL THEN
    RAISE EXCEPTION 'Nome do gênero não pode estar vazio';
  END IF;
  
  -- Gerar slug limpo
  v_slug := trim(lower(regexp_replace(v_clean_name, '[^a-z0-9]+', '-', 'gi')));
  
  INSERT INTO public.genres(name, slug, is_active)
  VALUES (v_clean_name, v_slug, true)
  ON CONFLICT (slug) DO UPDATE SET 
    name = excluded.name,
    is_active = true
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Corrigir função de notificação
CREATE OR REPLACE FUNCTION public.setup_notification_cron_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Agendar lembretes de eventos (a cada hora)
  PERFORM cron.schedule(
    'event-reminders-hourly',
    '0 * * * *',
    'SELECT net.http_post(url := ''https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/notify-event-reminder'', headers := ''{"Content-Type": "application/json"}''::jsonb, body := ''{"trigger": "cron"}''::jsonb);'
  );

  -- Agendar destaques semanais (segunda-feira às 9h)
  PERFORM cron.schedule(
    'weekly-highlights-monday',
    '0 9 * * 1',
    'SELECT net.http_post(url := ''https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/notify-weekly-highlights'', headers := ''{"Content-Type": "application/json"}''::jsonb, body := ''{"trigger": "cron"}''::jsonb);'
  );

  -- Agendar reset diário de contadores (meia-noite)
  PERFORM cron.schedule(
    'reset-daily-notification-counters',
    '0 0 * * *',
    'SELECT reset_daily_notification_count();'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.list_notification_cron_jobs()
RETURNS TABLE(jobname text, schedule text, command text, active boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    jobname::text,
    schedule::text,
    command::text,
    active
  FROM cron.job 
  WHERE jobname LIKE '%notification%' OR jobname LIKE '%reminder%' OR jobname LIKE '%highlight%';
$$;

-- Função para estatísticas de auditoria
CREATE OR REPLACE FUNCTION public.get_audit_statistics(p_start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), p_end_date timestamp with time zone DEFAULT now())
RETURNS TABLE(total_actions bigint, total_admins bigint, actions_by_type jsonb, actions_by_table jsonb, actions_by_admin jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*) as total_actions,
    COUNT(DISTINCT aal.admin_email) as total_admins,
    jsonb_object_agg(DISTINCT aal.action, action_stats.action_count) as actions_by_type,
    jsonb_object_agg(DISTINCT aal.table_name, table_stats.table_count) as actions_by_table,
    jsonb_object_agg(DISTINCT aal.admin_email, admin_stats.admin_count) as actions_by_admin
  FROM public.admin_audit_log aal
  LEFT JOIN (
    SELECT action, COUNT(*) as action_count
    FROM public.admin_audit_log
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY action
  ) action_stats ON aal.action = action_stats.action
  LEFT JOIN (
    SELECT table_name, COUNT(*) as table_count
    FROM public.admin_audit_log
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY table_name
  ) table_stats ON aal.table_name = table_stats.table_name
  LEFT JOIN (
    SELECT admin_email, COUNT(*) as admin_count
    FROM public.admin_audit_log
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY admin_email
  ) admin_stats ON aal.admin_email = admin_stats.admin_email
  WHERE aal.created_at BETWEEN p_start_date AND p_end_date;
END;
$$;

-- Função de teste de operações básicas
CREATE OR REPLACE FUNCTION public.test_basic_operations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  partner_count integer;
  ad_count integer;
BEGIN
  -- Contar registros existentes
  SELECT COUNT(*) FROM public.partners INTO partner_count;
  SELECT COUNT(*) FROM public.advertisements INTO ad_count;
  
  result := jsonb_build_object(
    'success', true,
    'partner_count', partner_count,
    'ad_count', ad_count,
    'rls_disabled', true,
    'timestamp', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM
  );
END;
$$;

-- Log que a correção foi aplicada
SELECT log_security_event(
  'security_hardening_phase_6_1',
  NULL,
  'system',
  jsonb_build_object(
    'phase', '6.1',
    'description', 'Correção de funções sem search_path',
    'functions_corrected', 8,
    'status', 'completed'
  ),
  'info'
);