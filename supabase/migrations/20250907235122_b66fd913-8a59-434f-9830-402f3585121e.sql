-- Configurar cron job para backup diário às 2h da manhã
SELECT cron.schedule(
  'daily-system-backup',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/daily-backup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) as request_id;
  $$
);

-- Função para validar se um email é admin válido
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users au
    JOIN public.approved_admins aa ON au.email = aa.email
    WHERE au.email = session_email 
    AND au.is_active = true 
    AND aa.is_active = true
  )
$$;