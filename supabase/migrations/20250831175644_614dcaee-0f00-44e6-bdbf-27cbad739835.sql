-- Remove o constraint atual
ALTER TABLE public.blog_posts
DROP CONSTRAINT blog_posts_city_check;

-- Adiciona constraint mais flexível para permitir multi-cidade
ALTER TABLE public.blog_posts
ADD CONSTRAINT blog_posts_city_check
CHECK (
  city IS NULL
  OR LOWER(city) IN ('poa','sp','rj','curitiba','floripa')
);