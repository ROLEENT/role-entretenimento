-- Fix overly permissive RLS policies

-- 1. Fix agenda_itens table - too permissive read_agenda_itens_admin policy
DROP POLICY IF EXISTS "read_agenda_itens_admin" ON public.agenda_itens;

-- Create proper admin policy for agenda_itens
CREATE POLICY "Admin can manage all agenda items" 
ON public.agenda_itens 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- 2. Fix artists table - too permissive policies
DROP POLICY IF EXISTS "artists_rw" ON public.artists;
DROP POLICY IF EXISTS "artists_read_public" ON public.artists;

-- Create proper read policy for artists (only active ones publicly visible)
CREATE POLICY "Public can view only active artists" 
ON public.artists 
FOR SELECT 
USING (status = 'active');

-- 3. Fix artists_artist_types table - too permissive
DROP POLICY IF EXISTS "artists_artist_types_rw" ON public.artists_artist_types;

CREATE POLICY "Anyone can view artist types relationships" 
ON public.artists_artist_types 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage artist types relationships" 
ON public.artists_artist_types 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- 4. Fix artists_genres table - too permissive
DROP POLICY IF EXISTS "artists_genres_rw" ON public.artists_genres;

CREATE POLICY "Anyone can view artist genres relationships" 
ON public.artists_genres 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage artist genres relationships" 
ON public.artists_genres 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- 5. Fix blog_posts table - too permissive dev policy
DROP POLICY IF EXISTS "dev_blog_posts_all_access" ON public.blog_posts;

-- Only keep proper policies for blog posts
-- (the existing "Anyone can view published posts" and "Editors can insert own posts" are appropriate)

-- 6. Fix artist_types table - too permissive
DROP POLICY IF EXISTS "Authenticated users can manage artist types" ON public.artist_types;

CREATE POLICY "Admins can manage artist types" 
ON public.artist_types 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- 7. Fix agenda_item_artists table - too permissive
DROP POLICY IF EXISTS "agenda_item_artists_rw" ON public.agenda_item_artists;

CREATE POLICY "Anyone can view agenda item artists" 
ON public.agenda_item_artists 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage agenda item artists" 
ON public.agenda_item_artists 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- 8. Fix activity_feed - System insert policy too broad
DROP POLICY IF EXISTS "Sistema pode criar atividades" ON public.activity_feed;

CREATE POLICY "Service role can create activities" 
ON public.activity_feed 
FOR INSERT 
WITH CHECK (
  -- Only allow system/service to create activities, not general users
  auth.role() = 'service_role' OR 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- 9. Fix artist_spotify_data - too permissive management
DROP POLICY IF EXISTS "System can manage artist data" ON public.artist_spotify_data;

CREATE POLICY "Service role can manage artist data" 
ON public.artist_spotify_data 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');