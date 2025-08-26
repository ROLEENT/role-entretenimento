-- Criar tabelas para funcionalidades avançadas (apenas se não existirem)

-- Tabela para campanhas de push notifications
CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  city text,
  type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  recipients_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  opened_count integer NOT NULL DEFAULT 0,
  target_audience text NOT NULL DEFAULT 'all',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para métricas de performance
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  value numeric NOT NULL,
  threshold_warning numeric NOT NULL DEFAULT 80,
  threshold_critical numeric NOT NULL DEFAULT 95,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para notification_campaigns
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS para performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON public.notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_scheduled_at ON public.notification_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);