-- Create posts_public table based on blog_posts structure for public consumption
CREATE TABLE public.posts_public AS 
SELECT 
  id,
  slug,
  title,
  summary as excerpt,
  cover_image as cover_url,
  city as section,
  reading_time,
  published_at,
  status,
  views as reads,
  0 as saves -- placeholder for saves column
FROM public.blog_posts 
WHERE status = 'published';

-- Enable RLS on posts_public table  
ALTER TABLE public.posts_public ENABLE ROW LEVEL SECURITY;

-- Create policy to allow SELECT only for published posts
CREATE POLICY revista_read_published
ON public.posts_public
FOR SELECT
TO anon, authenticated
USING (status = 'published');