-- Create site_metrics table (only if not exists)
CREATE TABLE IF NOT EXISTS public.site_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  people_reached INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  cities INTEGER NOT NULL DEFAULT 0,
  followers INTEGER NOT NULL DEFAULT 0,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (skip if already enabled)
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view site metrics" ON public.site_metrics;
DROP POLICY IF EXISTS "Admins can manage site metrics" ON public.site_metrics;

-- Create policy for public read access
CREATE POLICY "Anyone can view site metrics" 
ON public.site_metrics 
FOR SELECT 
USING (is_current = true);

-- Create policy for admin access
CREATE POLICY "Admins can manage site metrics" 
ON public.site_metrics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
));

-- Insert default metrics (use upsert)
INSERT INTO public.site_metrics (people_reached, views, cities, followers, is_current)
VALUES (550000, 2000000, 5, 24000, true)
ON CONFLICT (id) DO NOTHING;

-- Ensure we have at least one current metric
UPDATE public.site_metrics 
SET is_current = true 
WHERE id = (SELECT id FROM public.site_metrics ORDER BY created_at DESC LIMIT 1);