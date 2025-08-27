-- Remover Security Definer View problemático
DROP VIEW IF EXISTS analytics_summary CASCADE;

-- Recriar analytics_summary como view normal (sem SECURITY DEFINER)
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
  event_name,
  date_trunc('day', created_at) as date,
  city,
  source,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
GROUP BY event_name, date_trunc('day', created_at), city, source
ORDER BY date DESC;

-- Garantir que a tabela highlights tem todos os campos necessários
ALTER TABLE highlights 
  ADD COLUMN IF NOT EXISTS event_time time,
  ADD COLUMN IF NOT EXISTS ticket_price text;