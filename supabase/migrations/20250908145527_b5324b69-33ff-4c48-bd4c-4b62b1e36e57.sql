-- Create performance_alerts table for monitoring
CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access for performance monitoring
CREATE POLICY "Performance alerts are publicly accessible" 
ON public.performance_alerts 
FOR ALL 
USING (true);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.perf_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  connection_type TEXT,
  device_memory NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.perf_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for performance metrics
CREATE POLICY "Performance metrics are publicly accessible" 
ON public.perf_metrics 
FOR ALL 
USING (true);

-- Create JS errors table
CREATE TABLE IF NOT EXISTS public.js_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  error_message TEXT NOT NULL,
  source TEXT,
  line_number INTEGER,
  column_number INTEGER,
  stack_trace TEXT,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.js_errors ENABLE ROW LEVEL SECURITY;

-- Create policy for JS errors
CREATE POLICY "JS errors are publicly accessible" 
ON public.js_errors 
FOR ALL 
USING (true);