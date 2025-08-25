-- Criar tabela de categorias musicais
CREATE TABLE IF NOT EXISTS public.music_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  color_hex text DEFAULT '#3B82F6',
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.music_categories (name, slug, icon, color_hex) VALUES
('Funk', 'funk', 'Volume2', '#EC4899'),
('Eletrônica', 'eletronica', 'Headphones', '#3B82F6'),
('Rock', 'rock', 'Guitar', '#EF4444'),
('Hip Hop', 'hip-hop', 'Mic', '#F59E0B'),
('Sertanejo', 'sertanejo', 'Music', '#10B981'),
('Pop', 'pop', 'Zap', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;

-- Criar tabela ponte evento-categorias
CREATE TABLE IF NOT EXISTS public.event_categories (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.music_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, category_id)
);

-- Criar tabela de métricas do site
CREATE TABLE IF NOT EXISTS public.site_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reach_thousands int,
  views_millions numeric(6,2),
  active_cities int,
  followers_thousands int,
  captured_at date DEFAULT current_date,
  is_current boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

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

-- Inserir métrica inicial
INSERT INTO public.site_metrics (reach_thousands, views_millions, active_cities, followers_thousands, is_current)
VALUES (850, 2.3, 6, 120, true)
ON CONFLICT DO NOTHING;

-- Criar tabela de depoimentos
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  avatar_url text,
  quote text NOT NULL,
  rating smallint DEFAULT 5,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir depoimentos padrão
INSERT INTO public.testimonials (name, role, avatar_url, quote, rating, is_published) VALUES
('Marina Silva', 'DJ e Produtora', '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png', 'O ROLÊ revolucionou como descubro eventos na cidade. Interface limpa e informações sempre atualizadas!', 5, true),
('Carlos Santos', 'Músico Independente', '/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png', 'Desde que uso o ROLÊ, nunca mais perdi um show que queria ir. A curadoria é impecável!', 5, true),
('Ana Costa', 'Amante da Noite', null, 'Finalmente um app que entende a cena musical brasileira. Descobri bandas incríveis através das recomendações.', 4, true)
ON CONFLICT DO NOTHING;

-- Criar bucket para avatares de depoimentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('testimonials', 'testimonials', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- RLS para categorias musicais
ALTER TABLE public.music_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view music categories" ON public.music_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage music categories" ON public.music_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND is_active = true)
);

-- RLS para event_categories
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view event categories" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage event categories" ON public.event_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND is_active = true)
);

-- RLS para métricas
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view current metrics" ON public.site_metrics FOR SELECT USING (is_current = true);
CREATE POLICY "Admins can manage metrics" ON public.site_metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND is_active = true)
);

-- RLS para depoimentos
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published testimonials" ON public.testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND is_active = true)
);

-- RLS para bucket testimonials
CREATE POLICY "Public can view testimonial avatars" ON storage.objects FOR SELECT USING (bucket_id = 'testimonials');
CREATE POLICY "Admins can upload testimonial avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'testimonials' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Admins can update testimonial avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'testimonials' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Admins can delete testimonial avatars" ON storage.objects FOR DELETE USING (
  bucket_id = 'testimonials' AND auth.uid() IS NOT NULL
);