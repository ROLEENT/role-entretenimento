-- Limpar duplicatas antes de criar o índice único
DELETE FROM public.genres a USING public.genres b 
WHERE a.id > b.id AND lower(a.name) = lower(b.name);

-- Agora criar as tabelas e índices
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

-- Tabela de funções do artista
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

-- Ativar RLS apenas se ainda não estiver ativo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.tablename = 'genres' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;