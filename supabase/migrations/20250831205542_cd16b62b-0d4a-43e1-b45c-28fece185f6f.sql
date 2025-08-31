-- Corrigir política RLS para blog_posts permitir leitura pública de posts publicados
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;

CREATE POLICY "Public can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
TO anon, authenticated
USING (status = 'published'::article_status);