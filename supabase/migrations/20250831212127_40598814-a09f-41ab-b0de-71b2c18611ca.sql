-- Drop existing policy if it exists on blog_posts
DROP POLICY IF EXISTS revista_read_published ON public.blog_posts;

-- Create policy to allow public and authenticated users to read published blog posts
CREATE POLICY revista_read_published
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');