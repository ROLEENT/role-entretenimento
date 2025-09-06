-- Limpar dados duplicados/nulos antes de criar índices
DELETE FROM public.genres WHERE name IS NULL OR trim(name) = '';

-- Tabela de gêneros musicais
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (trim(name) != ''),
  slug CITEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índice único para nome (case insensitive) - só se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'genres_name_key') THEN
    CREATE UNIQUE INDEX genres_name_key ON public.genres(lower(trim(name)));
  END IF;
END$$;

-- Tabela de funções do artista (DJ, Produtor, Designer, etc.)
CREATE TABLE IF NOT EXISTS public.artist_roles_lookup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (trim(name) != ''),
  slug CITEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice único para nome (case insensitive) - só se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'artist_roles_lookup_name_key') THEN
    CREATE UNIQUE INDEX artist_roles_lookup_name_key ON public.artist_roles_lookup(lower(trim(name)));
  END IF;
END$$;

-- Relação N:N entre artistas e gêneros
CREATE TABLE IF NOT EXISTS public.artist_genres (
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE RESTRICT,
  PRIMARY KEY (artist_id, genre_id)
);

-- Relação N:N entre artistas e funções
CREATE TABLE IF NOT EXISTS public.artist_roles (
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.artist_roles_lookup(id) ON DELETE RESTRICT,
  PRIMARY KEY (artist_id, role_id)
);

-- Função helper para criar/garantir gêneros pelo nome
CREATE OR REPLACE FUNCTION public.ensure_genre(p_name TEXT)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  v_id UUID;
  v_slug TEXT;
  v_clean_name TEXT;
BEGIN
  -- Limpar e validar nome
  v_clean_name := trim(p_name);
  IF v_clean_name = '' OR v_clean_name IS NULL THEN
    RAISE EXCEPTION 'Nome do gênero não pode estar vazio';
  END IF;
  
  -- Gerar slug limpo
  v_slug := trim(lower(regexp_replace(v_clean_name, '[^a-z0-9]+', '-', 'gi')));
  
  INSERT INTO public.genres(name, slug, created_by)
  VALUES (v_clean_name, v_slug, auth.uid())
  ON CONFLICT (slug) DO UPDATE SET 
    name = excluded.name,
    is_active = true
  RETURNING id INTO v_id;
  
  RETURN v_id;
END$$;

-- Função helper para criar/garantir funções de artista pelo nome
CREATE OR REPLACE FUNCTION public.ensure_artist_role(p_name TEXT)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  v_id UUID;
  v_slug TEXT;
  v_clean_name TEXT;
BEGIN
  -- Limpar e validar nome
  v_clean_name := trim(p_name);
  IF v_clean_name = '' OR v_clean_name IS NULL THEN
    RAISE EXCEPTION 'Nome da função não pode estar vazio';
  END IF;
  
  -- Gerar slug limpo
  v_slug := trim(lower(regexp_replace(v_clean_name, '[^a-z0-9]+', '-', 'gi')));
  
  INSERT INTO public.artist_roles_lookup(name, slug)
  VALUES (v_clean_name, v_slug)
  ON CONFLICT (slug) DO UPDATE SET 
    name = excluded.name,
    is_active = true
  RETURNING id INTO v_id;
  
  RETURN v_id;
END$$;

-- RLS policies para genres
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage genres" ON public.genres;
CREATE POLICY "Admins can manage genres" ON public.genres
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (current_setting('request.headers', true))::json ->> 'x-admin-email' 
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view active genres" ON public.genres;
CREATE POLICY "Anyone can view active genres" ON public.genres
FOR SELECT USING (is_active = true);

-- RLS policies para artist_roles_lookup
ALTER TABLE public.artist_roles_lookup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage artist roles" ON public.artist_roles_lookup;
CREATE POLICY "Admins can manage artist roles" ON public.artist_roles_lookup
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (current_setting('request.headers', true))::json ->> 'x-admin-email' 
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view active artist roles" ON public.artist_roles_lookup;
CREATE POLICY "Anyone can view active artist roles" ON public.artist_roles_lookup
FOR SELECT USING (is_active = true);

-- RLS policies para artist_genres
ALTER TABLE public.artist_genres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage artist genres" ON public.artist_genres;
CREATE POLICY "Admins can manage artist genres" ON public.artist_genres
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (current_setting('request.headers', true))::json ->> 'x-admin-email' 
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view artist genres" ON public.artist_genres;
CREATE POLICY "Anyone can view artist genres" ON public.artist_genres
FOR SELECT USING (true);

-- RLS policies para artist_roles
ALTER TABLE public.artist_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage artist roles relationships" ON public.artist_roles;
CREATE POLICY "Admins can manage artist roles relationships" ON public.artist_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (current_setting('request.headers', true))::json ->> 'x-admin-email' 
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Anyone can view artist roles relationships" ON public.artist_roles;
CREATE POLICY "Anyone can view artist roles relationships" ON public.artist_roles
FOR SELECT USING (true);

-- Seeds úteis
INSERT INTO public.genres (name, slug) VALUES 
  ('House', 'house'),
  ('Techno', 'techno'),
  ('Hip Hop', 'hip-hop'),
  ('Funk', 'funk'),
  ('Pop', 'pop'),
  ('Rock', 'rock'),
  ('Jazz', 'jazz'),
  ('Blues', 'blues'),
  ('Reggae', 'reggae'),
  ('Samba', 'samba')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.artist_roles_lookup (name, slug) VALUES 
  ('DJ', 'dj'),
  ('Produtor', 'produtor'),
  ('Designer', 'designer'),
  ('Cantor', 'cantor'),
  ('Músico', 'musico'),
  ('Compositor', 'compositor'),
  ('Instrumentista', 'instrumentista'),
  ('Beatmaker', 'beatmaker')
ON CONFLICT (slug) DO NOTHING;