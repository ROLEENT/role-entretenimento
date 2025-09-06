-- Verificar estrutura atual da tabela follows e ajustar
DO $$
BEGIN
  -- Primeiro, dropar a tabela follows se ela existir e recriar com estrutura correta
  DROP TABLE IF EXISTS public.follows;
  
  -- Criar tabela follows com estrutura correta
  CREATE TABLE public.follows (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type text,
    entity_uuid uuid,
    entity_slug text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, following_id),
    UNIQUE(user_id, entity_type, entity_uuid, entity_slug)
  );

  -- Criar tabelas para funcionalidades de rolezeiros
  -- Tabela para salvar eventos
  CREATE TABLE IF NOT EXISTS public.saves (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id uuid NOT NULL,
    collection text NOT NULL DEFAULT 'default',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, event_id, collection)
  );

  -- Tabela para confirmação de presença em eventos
  CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id uuid NOT NULL,
    status text NOT NULL CHECK (status IN ('going', 'maybe', 'went')),
    show_publicly boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, event_id)
  );

  -- Tabela para perfis públicos de usuários
  CREATE TABLE IF NOT EXISTS public.users_public (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    display_name text,
    avatar_url text,
    bio text,
    city_preferences text[],
    genre_preferences text[],
    accessibility_notes text,
    is_profile_public boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
  );

  -- Habilitar RLS
  ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.users_public ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

END $$;

-- Políticas RLS para saves
CREATE POLICY "Users can manage their own saves" ON public.saves
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para attendance
CREATE POLICY "Users can manage their own attendance" ON public.attendance
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view public attendance" ON public.attendance
FOR SELECT USING (show_publicly = true);

-- Políticas RLS para users_public
CREATE POLICY "Users can manage their own profile" ON public.users_public
FOR ALL USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view public profiles" ON public.users_public
FOR SELECT USING (is_profile_public = true OR auth.uid() = id);

-- Políticas RLS para follows
CREATE POLICY "Users can manage their own follows" ON public.follows
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Função para toggle save
CREATE OR REPLACE FUNCTION public.toggle_save(event_id uuid, collection text DEFAULT 'default')
RETURNS TABLE(saved boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  existing_save_id uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verificar se já existe
  SELECT id INTO existing_save_id
  FROM public.saves
  WHERE user_id = user_uuid AND saves.event_id = toggle_save.event_id AND saves.collection = toggle_save.collection;

  IF existing_save_id IS NOT NULL THEN
    -- Remove se existe
    DELETE FROM public.saves WHERE id = existing_save_id;
    RETURN QUERY SELECT false;
  ELSE
    -- Adiciona se não existe
    INSERT INTO public.saves (user_id, event_id, collection)
    VALUES (user_uuid, toggle_save.event_id, toggle_save.collection);
    RETURN QUERY SELECT true;
  END IF;
END;
$$;

-- Função para definir presença
CREATE OR REPLACE FUNCTION public.set_attendance(
  p_event_id uuid,
  p_status text,
  p_show_publicly boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.attendance (user_id, event_id, status, show_publicly, updated_at)
  VALUES (user_uuid, p_event_id, p_status, p_show_publicly, now())
  ON CONFLICT (user_id, event_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    show_publicly = EXCLUDED.show_publicly,
    updated_at = now();
END;
$$;

-- Função para buscar dados sociais do evento
CREATE OR REPLACE FUNCTION public.get_event_social(
  p_event_id uuid,
  p_limit integer DEFAULT 12
)
RETURNS TABLE(
  going_count bigint,
  maybe_count bigint,
  went_count bigint,
  avatars text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH counts AS (
    SELECT
      sum(CASE WHEN status = 'going' THEN 1 ELSE 0 END)::bigint AS going_count,
      sum(CASE WHEN status = 'maybe' THEN 1 ELSE 0 END)::bigint AS maybe_count,
      sum(CASE WHEN status = 'went' THEN 1 ELSE 0 END)::bigint AS went_count
    FROM public.attendance
    WHERE event_id = p_event_id
  ),
  pics AS (
    SELECT up.avatar_url
    FROM public.attendance a
    JOIN public.users_public up ON up.id = a.user_id
    WHERE a.event_id = p_event_id
      AND a.show_publicly = true
      AND up.is_profile_public = true
      AND up.avatar_url IS NOT NULL
    ORDER BY a.updated_at DESC
    LIMIT p_limit
  )
  SELECT
    counts.going_count,
    counts.maybe_count,
    counts.went_count,
    array(SELECT avatar_url FROM pics) AS avatars
  FROM counts;
END;
$$;

-- Função para garantir perfil de usuário
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_username text,
  p_display_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  final_username text;
  counter int := 0;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  final_username := p_username;
  
  -- Garantir username único
  WHILE EXISTS (SELECT 1 FROM public.users_public WHERE username = final_username AND id != user_uuid) LOOP
    counter := counter + 1;
    final_username := p_username || counter::text;
  END LOOP;

  INSERT INTO public.users_public (
    id, username, display_name, avatar_url, created_at, updated_at
  )
  VALUES (
    user_uuid, final_username, p_display_name, p_avatar_url, now(), now()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, users_public.username),
    display_name = COALESCE(EXCLUDED.display_name, users_public.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users_public.avatar_url),
    updated_at = now();

  RETURN user_uuid;
END;
$$;

-- Função para buscar presença pública por username
CREATE OR REPLACE FUNCTION public.get_user_public_attendance_by_username(
  p_username text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  event_id uuid,
  status text,
  updated_at timestamptz,
  title text,
  starts_at timestamptz,
  city text,
  cover_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ai.id as event_id,
    a.status,
    a.updated_at,
    ai.title,
    ai.starts_at,
    ai.city,
    ai.cover_url
  FROM public.users_public up
  JOIN public.attendance a ON a.user_id = up.id
  JOIN public.agenda_itens ai ON ai.id = a.event_id
  WHERE up.username = p_username
    AND up.is_profile_public = true
    AND a.show_publicly = true
  ORDER BY a.updated_at DESC
  LIMIT p_limit;
$$;

-- Função para buscar rolezeiros públicos
CREATE OR REPLACE FUNCTION public.search_rolezeiros_public(
  p_q text DEFAULT NULL,
  p_cities text[] DEFAULT NULL,
  p_genres text[] DEFAULT NULL,
  p_order text DEFAULT 'recentes',
  p_limit int DEFAULT 24,
  p_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  city_preferences text[],
  genre_preferences text[],
  joined_at timestamptz,
  last_attended timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      up.id,
      up.username,
      up.display_name,
      up.avatar_url,
      up.bio,
      up.city_preferences,
      up.genre_preferences,
      up.created_at as joined_at,
      (
        SELECT max(a.updated_at)
        FROM public.attendance a
        WHERE a.user_id = up.id
      ) as last_attended
    FROM public.users_public up
    WHERE up.is_profile_public = true
      AND (
        p_q IS NULL
        OR up.username ILIKE '%'||p_q||'%'
        OR COALESCE(up.display_name,'') ILIKE '%'||p_q||'%'
      )
      AND (
        p_cities IS NULL
        OR COALESCE(up.city_preferences,'{}') && p_cities
      )
      AND (
        p_genres IS NULL
        OR COALESCE(up.genre_preferences,'{}') && p_genres
      )
  )
  SELECT *
  FROM base
  ORDER BY
    CASE WHEN p_order = 'ativos' THEN COALESCE(last_attended, timestamp '1970-01-01') END DESC,
    CASE WHEN p_order = 'antigos' THEN joined_at END ASC,
    CASE WHEN p_order IS NULL OR p_order = 'recentes' THEN joined_at END DESC
  LIMIT GREATEST(p_limit, 1)
  OFFSET GREATEST(p_offset, 0);
$$;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_public_updated_at
  BEFORE UPDATE ON public.users_public
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_saves_user_event ON public.saves(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_updated ON public.attendance(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_users_public_username ON public.users_public(username);
CREATE INDEX IF NOT EXISTS idx_users_public_created_at ON public.users_public(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_user ON public.follows(user_id);