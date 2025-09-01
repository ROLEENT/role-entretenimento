-- Adicionar campo cities para suporte multi-cidade
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS cities text[] DEFAULT '{}';

-- Remover constraint atual
ALTER TABLE public.blog_posts
DROP CONSTRAINT blog_posts_city_check;

-- Adicionar constraint que permite city único OU array cities
ALTER TABLE public.blog_posts
ADD CONSTRAINT blog_posts_city_check
CHECK (
  (city IS NOT NULL AND LOWER(city) IN ('poa','sp','rj','curitiba','floripa'))
  OR (city IS NULL AND array_length(cities, 1) >= 1)
);