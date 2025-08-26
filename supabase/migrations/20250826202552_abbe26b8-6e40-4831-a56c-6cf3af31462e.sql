-- Create performance metrics table
CREATE TABLE public.perf_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ms',
  page_url TEXT NOT NULL,
  user_agent TEXT,
  connection_type TEXT,
  device_memory NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create JS errors table
CREATE TABLE public.js_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  page_url TEXT NOT NULL,
  line_number INTEGER,
  column_number INTEGER,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.perf_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.js_errors ENABLE ROW LEVEL SECURITY;

-- RLS policies for perf_metrics
CREATE POLICY "Anyone can insert performance metrics" 
ON public.perf_metrics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all performance metrics" 
ON public.perf_metrics 
FOR SELECT 
USING (is_admin_user());

-- RLS policies for js_errors
CREATE POLICY "Anyone can insert JS errors" 
ON public.js_errors 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all JS errors" 
ON public.js_errors 
FOR SELECT 
USING (is_admin_user());

-- Create indexes for better performance
CREATE INDEX idx_perf_metrics_created_at ON public.perf_metrics(created_at DESC);
CREATE INDEX idx_perf_metrics_metric_name ON public.perf_metrics(metric_name);
CREATE INDEX idx_perf_metrics_page_url ON public.perf_metrics(page_url);
CREATE INDEX idx_js_errors_created_at ON public.js_errors(created_at DESC);
CREATE INDEX idx_js_errors_message ON public.js_errors(error_message);

-- Function to get performance summary
CREATE OR REPLACE FUNCTION public.get_performance_summary(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  metric_name TEXT,
  avg_value NUMERIC,
  p75_value NUMERIC,
  p95_value NUMERIC,
  count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    pm.metric_name,
    ROUND(AVG(pm.metric_value), 2) as avg_value,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pm.metric_value), 2) as p75_value,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY pm.metric_value), 2) as p95_value,
    COUNT(*) as count
  FROM public.perf_metrics pm
  WHERE pm.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY pm.metric_name
  ORDER BY pm.metric_name;
END;
$$;

-- Function to get top errors
CREATE OR REPLACE FUNCTION public.get_top_errors(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  error_message TEXT,
  count BIGINT,
  last_occurred TIMESTAMP WITH TIME ZONE,
  affected_pages TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    je.error_message,
    COUNT(*) as count,
    MAX(je.created_at) as last_occurred,
    ARRAY_AGG(DISTINCT je.page_url) as affected_pages
  FROM public.js_errors je
  WHERE je.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY je.error_message
  ORDER BY COUNT(*) DESC
  LIMIT limit_count;
END;
$$;