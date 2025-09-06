-- Tabela de gêneros (sem conflitos)
CREATE TABLE IF NOT EXISTS public.genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug citext NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Criar índice apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'genres' AND indexname = 'genres_name_key'
  ) THEN
    CREATE UNIQUE INDEX genres_name_key ON public.genres(lower(name));
  END IF;
END $$;

-- Tabela de funções do artista (DJ, Produtor, Designer, etc.)
CREATE TABLE IF NOT EXISTS public.artist_roles_lookup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug citext NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Criar índice apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'artist_roles_lookup' AND indexname = 'artist_roles_lookup_name_key'
  ) THEN
    CREATE UNIQUE INDEX artist_roles_lookup_name_key ON public.artist_roles_lookup(lower(name));
  END IF;
END $$;

-- Relações N:N
CREATE TABLE IF NOT EXISTS public.artist_genres (
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  genre_id uuid NOT NULL REFERENCES public.genres(id) ON DELETE RESTRICT,
  PRIMARY KEY (artist_id, genre_id)
);

CREATE TABLE IF NOT EXISTS public.artist_roles (
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.artist_roles_lookup(id) ON DELETE RESTRICT,
  PRIMARY KEY (artist_id, role_id)
);

-- RLS policies para genres
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage all genres" ON public.genres
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

CREATE POLICY IF NOT EXISTS "Anyone can view active genres" ON public.genres
FOR SELECT USING (is_active = true);

-- RLS policies para artist_roles_lookup
ALTER TABLE public.artist_roles_lookup ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage all artist roles" ON public.artist_roles_lookup
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

CREATE POLICY IF NOT EXISTS "Anyone can view active artist roles" ON public.artist_roles_lookup
FOR SELECT USING (is_active = true);

-- RLS policies para relações N:N
ALTER TABLE public.artist_genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage artist genres" ON public.artist_genres
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

CREATE POLICY IF NOT EXISTS "Anyone can view artist genres" ON public.artist_genres
FOR SELECT USING (true);

ALTER TABLE public.artist_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage artist roles relationships" ON public.artist_roles
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

CREATE POLICY IF NOT EXISTS "Anyone can view artist roles relationships" ON public.artist_roles
FOR SELECT USING (true);

-- Seeds seguros que só inserem se não existir
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