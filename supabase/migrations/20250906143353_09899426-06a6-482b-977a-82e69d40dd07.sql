-- Tabela de gêneros
CREATE TABLE IF NOT EXISTS public.genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug citext NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS genres_name_key ON public.genres(lower(name));

-- Tabela de funções do artista (DJ, Produtor, Designer, etc.)
CREATE TABLE IF NOT EXISTS public.artist_roles_lookup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug citext NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS artist_roles_lookup_name_key ON public.artist_roles_lookup(lower(name));

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

-- Helpers para criar/garantir itens pelo nome
CREATE OR REPLACE FUNCTION public.ensure_genre(p_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  
  INSERT INTO public.genres(name, slug, is_active)
  VALUES (v_clean_name, v_slug, true)
  ON CONFLICT (slug) DO UPDATE SET 
    name = excluded.name,
    is_active = true
  RETURNING id INTO v_id;
  
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.ensure_artist_role(p_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  
  INSERT INTO public.artist_roles_lookup(name, slug, is_active)
  VALUES (v_clean_name, v_slug, true)
  ON CONFLICT (slug) DO UPDATE SET 
    name = excluded.name,
    is_active = true
  RETURNING id INTO v_id;
  
  RETURN v_id;
END $$;

-- Seeds úteis
SELECT ensure_genre('House');
SELECT ensure_genre('Techno');
SELECT ensure_genre('Hip Hop');
SELECT ensure_artist_role('DJ');
SELECT ensure_artist_role('Produtor');
SELECT ensure_artist_role('Designer');