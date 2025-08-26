-- Criar tabela testimonials se não existir
CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    author text NOT NULL,
    role text,
    quote text NOT NULL,
    source_url text,
    is_published boolean NOT NULL DEFAULT false,
    avatar_url text,
    rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela metrics se não existir  
CREATE TABLE IF NOT EXISTS public.metrics (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value numeric NOT NULL,
    label text NOT NULL,
    is_public boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para testimonials
DROP POLICY IF EXISTS "Public can read published testimonials" ON public.testimonials;
CREATE POLICY "Public can read published testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')))
WITH CHECK (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- Políticas RLS para metrics
DROP POLICY IF EXISTS "Public can read public metrics" ON public.metrics;
CREATE POLICY "Public can read public metrics" 
ON public.metrics 
FOR SELECT 
USING (is_public = true);

DROP POLICY IF EXISTS "Admins can read all metrics" ON public.metrics;
CREATE POLICY "Admins can read all metrics" 
ON public.metrics 
FOR SELECT 
USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

DROP POLICY IF EXISTS "Admins can manage metrics" ON public.metrics;
CREATE POLICY "Admins can manage metrics" 
ON public.metrics 
FOR ALL 
USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')))
WITH CHECK (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_testimonials()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at_metrics()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_testimonials();

DROP TRIGGER IF EXISTS update_metrics_updated_at ON public.metrics;
CREATE TRIGGER update_metrics_updated_at
BEFORE UPDATE ON public.metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_metrics();

-- Inserir métricas padrão se não existirem
INSERT INTO public.metrics (key, value, label, is_public) VALUES
('site_reach', 850, 'Alcance do Site (milhares)', true),
('page_views', 2.3, 'Visualizações (milhões)', true),
('active_cities', 6, 'Cidades Ativas', true),
('followers', 120, 'Seguidores (milhares)', true)
ON CONFLICT (key) DO NOTHING;