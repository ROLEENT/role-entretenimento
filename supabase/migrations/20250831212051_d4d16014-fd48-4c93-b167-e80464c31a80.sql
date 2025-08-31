-- Enable RLS on posts_public table
ALTER TABLE public.posts_public ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS revista_read_published ON public.posts_public;

-- Create policy to allow public and authenticated users to read published posts
CREATE POLICY revista_read_published
ON public.posts_public
FOR SELECT
TO anon, authenticated
USING (status = 'published');