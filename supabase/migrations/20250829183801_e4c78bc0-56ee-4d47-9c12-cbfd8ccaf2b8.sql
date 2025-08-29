-- Create function to schedule agenda jobs
CREATE OR REPLACE FUNCTION public.agenda_scheduler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call the edge function to handle publishing/unpublishing
  PERFORM net.http_post(
    url := 'https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/agenda-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxNzA5OCwiZXhwIjoyMDcxMDkzMDk4fQ.a5O-qPBpKMJGqhDdNt5jb3T-FSpFkafM8-0LDlHRV38"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  );
END;
$$;

-- Schedule the job to run every 5 minutes
SELECT cron.schedule(
  'agenda-scheduler-5min',
  '*/5 * * * *', -- Every 5 minutes
  'SELECT public.agenda_scheduler();'
);