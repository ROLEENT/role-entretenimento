-- Habilitar RLS nas novas tabelas
ALTER TABLE public.music_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS para categorias musicais
DROP POLICY IF EXISTS "Anyone can view music categories" ON public.music_categories;
CREATE POLICY "Anyone can view music categories" ON public.music_categories FOR SELECT USING (true);

-- RLS para métricas
DROP POLICY IF EXISTS "Anyone can view current metrics" ON public.site_metrics;
CREATE POLICY "Anyone can view current metrics" ON public.site_metrics FOR SELECT USING (is_current = true);

-- RLS para depoimentos
DROP POLICY IF EXISTS "Anyone can view published testimonials" ON public.testimonials;
CREATE POLICY "Anyone can view published testimonials" ON public.testimonials FOR SELECT USING (is_published = true);

-- Função para garantir apenas uma métrica atual
CREATE OR REPLACE FUNCTION public.ensure_single_current_metric()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_current THEN
    UPDATE public.site_metrics SET is_current = false WHERE id <> NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END $$;

-- Trigger para métrica única atual
DROP TRIGGER IF EXISTS trg_single_current_metric ON public.site_metrics;
CREATE TRIGGER trg_single_current_metric 
  BEFORE INSERT OR UPDATE ON public.site_metrics
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_current_metric();