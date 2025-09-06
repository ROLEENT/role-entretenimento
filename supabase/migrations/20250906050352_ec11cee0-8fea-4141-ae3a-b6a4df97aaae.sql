-- Perfil público do usuário
CREATE TABLE IF NOT EXISTS public.users_public (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username citext UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  city_preferences text[] DEFAULT '{}',
  genre_preferences text[] DEFAULT '{}',
  accessibility_notes text,
  is_profile_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Preferências de notificação
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT false,
  notification_topics text[] NOT NULL DEFAULT '{}'
);

-- Seguir entidades
CREATE TABLE IF NOT EXISTS public.follows (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('artist','venue','organizer','city','tag')),
  entity_uuid uuid,
  entity_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follows_entity_presence CHECK (
    (entity_type IN ('artist','venue','organizer') AND entity_uuid IS NOT NULL AND entity_slug IS NULL)
    OR
    (entity_type IN ('city','tag') AND entity_slug IS NOT NULL AND entity_uuid IS NULL)
  )
);

-- Salvar eventos
CREATE TABLE IF NOT EXISTS public.saves (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  collection text NOT NULL DEFAULT 'default',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saves_user_event_unique UNIQUE (user_id, event_id, collection)
);

-- Presença em eventos
DO $$ BEGIN
  CREATE TYPE public.attendance_status AS ENUM ('going','maybe','went');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.attendance (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  status public.attendance_status NOT NULL,
  show_publicly boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_user_event_unique UNIQUE (user_id, event_id)
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_users_public_username ON public.users_public (username);
CREATE INDEX IF NOT EXISTS idx_saves_event ON public.saves (event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance (event_id);
CREATE INDEX IF NOT EXISTS idx_follows_user ON public.follows (user_id);
CREATE INDEX IF NOT EXISTS idx_follows_type_slug ON public.follows (entity_type, entity_slug) WHERE entity_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_follows_type_uuid ON public.follows (entity_type, entity_uuid) WHERE entity_uuid IS NOT NULL;