-- Apply RLS policy to blog_posts table for anonymous reading access
-- (Note: posts_public table doesn't exist, the real table is blog_posts)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS revista_read_published ON public.blog_posts;

-- Create policy to allow anonymous and authenticated users to read published blog posts
CREATE POLICY revista_read_published
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Ensure agenda_itens table allows anonymous reading for Home page
-- (updating existing policy to be more permissive)
DROP POLICY IF EXISTS agenda_read_published ON public.agenda_itens;

CREATE POLICY agenda_read_published
ON public.agenda_itens
FOR SELECT
TO anon, authenticated
USING (status = 'published' AND deleted_at IS NULL);

-- Also apply to related tables that might be used by Home/Revista pages
-- Apply to artists table for public reading
DROP POLICY IF EXISTS artists_public_read ON public.artists;

CREATE POLICY artists_public_read
ON public.artists
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Apply to venues table for public reading
DROP POLICY IF EXISTS venues_public_read ON public.venues;

CREATE POLICY venues_public_read
ON public.venues
FOR SELECT
TO anon, authenticated
USING (true);

-- Apply to organizers table for public reading
DROP POLICY IF EXISTS organizers_public_read ON public.organizers;

CREATE POLICY organizers_public_read
ON public.organizers
FOR SELECT
TO anon, authenticated
USING (true);