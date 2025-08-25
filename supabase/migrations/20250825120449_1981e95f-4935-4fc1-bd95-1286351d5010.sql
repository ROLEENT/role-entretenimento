-- Criar apenas estruturas que não existem
CREATE TABLE IF NOT EXISTS public.music_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  color_hex text DEFAULT '#3B82F6',
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir categorias padrão apenas se não existirem
INSERT INTO public.music_categories (name, slug, icon, color_hex) VALUES
('Funk', 'funk', 'Volume2', '#EC4899'),
('Eletrônica', 'eletronica', 'Headphones', '#3B82F6'),
('Rock', 'rock', 'Guitar', '#EF4444'),
('Hip Hop', 'hip-hop', 'Mic', '#F59E0B'),
('Sertanejo', 'sertanejo', 'Music', '#10B981'),
('Pop', 'pop', 'Zap', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;

-- Tabela de métricas
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

-- Inserir métrica inicial se não existir
INSERT INTO public.site_metrics (reach_thousands, views_millions, active_cities, followers_thousands, is_current)
SELECT 850, 2.3, 6, 120, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_metrics LIMIT 1);

-- Tabela de depoimentos
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

-- Bucket para depoimentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('testimonials', 'testimonials', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;