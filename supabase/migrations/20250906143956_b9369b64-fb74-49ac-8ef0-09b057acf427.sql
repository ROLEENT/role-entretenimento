-- Adicionar RLS policies para as tabelas que estão faltando
ALTER TABLE public.artist_roles_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_roles ENABLE ROW LEVEL SECURITY;

-- Policies para genres (já tem RLS ativo)
DROP POLICY IF EXISTS "Admins can manage all genres" ON public.genres;
CREATE POLICY "Admins can manage all genres" ON public.genres
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view active genres" ON public.genres;
CREATE POLICY "Anyone can view active genres" ON public.genres
FOR SELECT USING (is_active = true);

-- Policies para artist_roles_lookup
DROP POLICY IF EXISTS "Admins can manage all artist roles" ON public.artist_roles_lookup;
CREATE POLICY "Admins can manage all artist roles" ON public.artist_roles_lookup
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view active artist roles" ON public.artist_roles_lookup;
CREATE POLICY "Anyone can view active artist roles" ON public.artist_roles_lookup
FOR SELECT USING (is_active = true);

-- Policies para artist_genres
DROP POLICY IF EXISTS "Admins can manage artist genres" ON public.artist_genres;
CREATE POLICY "Admins can manage artist genres" ON public.artist_genres
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view artist genres" ON public.artist_genres;
CREATE POLICY "Anyone can view artist genres" ON public.artist_genres
FOR SELECT USING (true);

-- Policies para artist_roles
DROP POLICY IF EXISTS "Admins can manage artist roles relationships" ON public.artist_roles;
CREATE POLICY "Admins can manage artist roles relationships" ON public.artist_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view artist roles relationships" ON public.artist_roles;
CREATE POLICY "Anyone can view artist roles relationships" ON public.artist_roles
FOR SELECT USING (true);

-- Seeds seguros
INSERT INTO public.genres (name, slug, is_active) 
VALUES ('Techno', 'techno', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.genres (name, slug, is_active) 
VALUES ('Hip Hop', 'hip-hop', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.artist_roles_lookup (name, slug, is_active) 
VALUES ('DJ', 'dj', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.artist_roles_lookup (name, slug, is_active) 
VALUES ('Produtor', 'produtor', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.artist_roles_lookup (name, slug, is_active) 
VALUES ('Designer', 'designer', true)
ON CONFLICT (slug) DO NOTHING;