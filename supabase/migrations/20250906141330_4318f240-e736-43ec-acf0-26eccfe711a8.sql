-- Atualizar estrutura da tabela genres existente
ALTER TABLE public.genres 
  ALTER COLUMN active SET DEFAULT true,
  ALTER COLUMN is_active SET DEFAULT true;

-- Garantir que slug seja único
UPDATE public.genres SET slug = 'genre-' || id::text WHERE slug IS NULL OR slug = '';
ALTER TABLE public.genres ALTER COLUMN slug SET NOT NULL;

-- Criar índice único no slug se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'genres_slug_unique') THEN
    ALTER TABLE public.genres ADD CONSTRAINT genres_slug_unique UNIQUE (slug);
  END IF;
END$$;

-- Tabela de funções do artista (DJ, Produtor, Designer, etc.)
CREATE TABLE IF NOT EXISTS public.artist_roles_lookup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (trim(name) != ''),
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- Função helper para criar/garantir gêneros pelo nome (adaptada para estrutura existente)
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
  
  INSERT INTO public.genres(name, slug, active, is_active)
  VALUES (v_clean_name, v_slug, true, true)
  ON CONFLICT (slug) DO UPDATE SET 
    name = excluded.name,
    active = true,
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

-- Seeds para artist roles
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

-- Seeds para genres usando a função ensure_genre
SELECT public.ensure_genre('House');
SELECT public.ensure_genre('Techno');
SELECT public.ensure_genre('Hip Hop');
SELECT public.ensure_genre('Funk');
SELECT public.ensure_genre('Pop');
SELECT public.ensure_genre('Rock');
SELECT public.ensure_genre('Jazz');
SELECT public.ensure_genre('Blues');
SELECT public.ensure_genre('Reggae');
SELECT public.ensure_genre('Samba');