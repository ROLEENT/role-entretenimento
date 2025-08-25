-- Criar tabelas para analytics detalhadas de notificações

-- Tabela para armazenar métricas agregadas de notificações
CREATE TABLE public.notification_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  notification_type text NOT NULL,
  city text,
  target_audience text,
  total_sent integer NOT NULL DEFAULT 0,
  total_delivered integer NOT NULL DEFAULT 0,
  total_opened integer NOT NULL DEFAULT 0,
  total_clicked integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  total_unsubscribed integer NOT NULL DEFAULT 0,
  avg_delivery_time_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para logs detalhados de cada notificação individual
CREATE TABLE public.notification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id uuid,
  user_id uuid,
  subscription_id uuid,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  city text,
  target_audience text,
  status text NOT NULL, -- 'sent', 'delivered', 'failed', 'opened', 'clicked'
  delivery_time_ms integer,
  error_message text,
  user_agent text,
  device_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  event_id uuid,
  campaign_id text
);

-- Tabela para tracking de campanhas de notificação
CREATE TABLE public.notification_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  target_audience text NOT NULL,
  target_cities text[],
  target_event_id uuid,
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  total_recipients integer DEFAULT 0,
  total_sent integer DEFAULT 0,
  total_delivered integer DEFAULT 0,
  total_opened integer DEFAULT 0,
  total_clicked integer DEFAULT 0,
  total_failed integer DEFAULT 0,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes para performance
CREATE INDEX idx_notification_analytics_date ON public.notification_analytics(date);
CREATE INDEX idx_notification_analytics_type ON public.notification_analytics(notification_type);
CREATE INDEX idx_notification_analytics_city ON public.notification_analytics(city);
CREATE INDEX idx_notification_logs_notification_id ON public.notification_logs(notification_id);
CREATE INDEX idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notification_logs_created_at ON public.notification_logs(created_at);
CREATE INDEX idx_notification_logs_type ON public.notification_logs(notification_type);
CREATE INDEX idx_notification_campaigns_status ON public.notification_campaigns(status);
CREATE INDEX idx_notification_campaigns_created_at ON public.notification_campaigns(created_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_notification_analytics_updated_at
  BEFORE UPDATE ON public.notification_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_campaigns_updated_at
  BEFORE UPDATE ON public.notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies para notification_analytics
CREATE POLICY "Admins can manage notification analytics" ON public.notification_analytics
FOR ALL USING (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
) WITH CHECK (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

-- Policies para notification_logs
CREATE POLICY "Admins can manage notification logs" ON public.notification_logs
FOR ALL USING (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
) WITH CHECK (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

-- Policies para notification_campaigns
CREATE POLICY "Admins can manage notification campaigns" ON public.notification_campaigns
FOR ALL USING (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
) WITH CHECK (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

-- Função para calcular métricas agregadas
CREATE OR REPLACE FUNCTION public.calculate_notification_metrics(
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE,
  p_notification_type text DEFAULT NULL,
  p_city text DEFAULT NULL
) RETURNS TABLE(
  date date,
  notification_type text,
  city text,
  total_sent bigint,
  total_delivered bigint,
  total_opened bigint,
  total_clicked bigint,
  total_failed bigint,
  delivery_rate numeric,
  open_rate numeric,
  click_rate numeric,
  avg_delivery_time_ms numeric
) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nl.created_at::date as date,
    nl.notification_type,
    nl.city,
    COUNT(*) FILTER (WHERE nl.status IN ('sent', 'delivered', 'opened', 'clicked')) as total_sent,
    COUNT(*) FILTER (WHERE nl.status IN ('delivered', 'opened', 'clicked')) as total_delivered,
    COUNT(*) FILTER (WHERE nl.status IN ('opened', 'clicked')) as total_opened,
    COUNT(*) FILTER (WHERE nl.status = 'clicked') as total_clicked,
    COUNT(*) FILTER (WHERE nl.status = 'failed') as total_failed,
    ROUND(
      (COUNT(*) FILTER (WHERE nl.status IN ('delivered', 'opened', 'clicked'))::numeric / 
       NULLIF(COUNT(*) FILTER (WHERE nl.status IN ('sent', 'delivered', 'opened', 'clicked', 'failed')), 0)) * 100, 2
    ) as delivery_rate,
    ROUND(
      (COUNT(*) FILTER (WHERE nl.status IN ('opened', 'clicked'))::numeric / 
       NULLIF(COUNT(*) FILTER (WHERE nl.status IN ('delivered', 'opened', 'clicked')), 0)) * 100, 2
    ) as open_rate,
    ROUND(
      (COUNT(*) FILTER (WHERE nl.status = 'clicked')::numeric / 
       NULLIF(COUNT(*) FILTER (WHERE nl.status IN ('opened', 'clicked')), 0)) * 100, 2
    ) as click_rate,
    ROUND(AVG(nl.delivery_time_ms) FILTER (WHERE nl.delivery_time_ms IS NOT NULL), 0) as avg_delivery_time_ms
  FROM public.notification_logs nl
  WHERE 
    nl.created_at::date BETWEEN p_start_date AND p_end_date
    AND (p_notification_type IS NULL OR nl.notification_type = p_notification_type)
    AND (p_city IS NULL OR nl.city = p_city)
  GROUP BY nl.created_at::date, nl.notification_type, nl.city
  ORDER BY nl.created_at::date DESC, nl.notification_type, nl.city;
END;
$$;

-- Função para obter estatísticas de performance por horário
CREATE OR REPLACE FUNCTION public.get_notification_performance_by_hour()
RETURNS TABLE(
  hour_of_day integer,
  total_sent bigint,
  total_opened bigint,
  open_rate numeric
) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM nl.created_at)::integer as hour_of_day,
    COUNT(*) FILTER (WHERE nl.status IN ('sent', 'delivered', 'opened', 'clicked')) as total_sent,
    COUNT(*) FILTER (WHERE nl.status IN ('opened', 'clicked')) as total_opened,
    ROUND(
      (COUNT(*) FILTER (WHERE nl.status IN ('opened', 'clicked'))::numeric / 
       NULLIF(COUNT(*) FILTER (WHERE nl.status IN ('sent', 'delivered', 'opened', 'clicked')), 0)) * 100, 2
    ) as open_rate
  FROM public.notification_logs nl
  WHERE nl.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY EXTRACT(HOUR FROM nl.created_at)
  ORDER BY hour_of_day;
END;
$$;