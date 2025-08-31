-- Enable RLS on blog_posts table if not already enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS revista_read_published ON public.blog_posts;

-- Create policy to allow public and authenticated users to read published blog posts
CREATE POLICY revista_read_published
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');