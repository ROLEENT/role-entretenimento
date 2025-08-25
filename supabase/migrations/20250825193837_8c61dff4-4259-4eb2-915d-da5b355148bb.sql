-- Habilitar realtime para tabelas relevantes
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_comments REPLICA IDENTITY FULL;
ALTER TABLE public.highlight_comments REPLICA IDENTITY FULL;
ALTER TABLE public.event_favorites REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.highlight_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_favorites;

-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função para agendar cron jobs de notificações
CREATE OR REPLACE FUNCTION public.setup_notification_cron_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Agendar lembretes de eventos (a cada hora)
  PERFORM cron.schedule(
    'event-reminders-hourly',
    '0 * * * *', -- Todo hora no minuto 0
    $$
    SELECT net.http_post(
      url := 'https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/notify-event-reminder',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c"}'::jsonb,
      body := '{"trigger": "cron"}'::jsonb
    );
    $$
  );

  -- Agendar destaques semanais (segunda-feira às 9h)
  PERFORM cron.schedule(
    'weekly-highlights-monday',
    '0 9 * * 1', -- Segunda-feira às 9h
    $$
    SELECT net.http_post(
      url := 'https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/notify-weekly-highlights',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c"}'::jsonb,
      body := '{"trigger": "cron"}'::jsonb
    );
    $$
  );

  -- Agendar reset diário de contadores (meia-noite)
  PERFORM cron.schedule(
    'reset-daily-notification-counters',
    '0 0 * * *', -- Meia-noite todos os dias
    $$
    SELECT reset_daily_notification_count();
    $$
  );
END;
$$;

-- Executar setup dos cron jobs
SELECT setup_notification_cron_jobs();

-- Função para listar cron jobs ativos
CREATE OR REPLACE FUNCTION public.list_notification_cron_jobs()
RETURNS TABLE(jobname text, schedule text, command text, active boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    jobname::text,
    schedule::text,
    command::text,
    active
  FROM cron.job 
  WHERE jobname LIKE '%notification%' OR jobname LIKE '%reminder%' OR jobname LIKE '%highlight%';
$$;