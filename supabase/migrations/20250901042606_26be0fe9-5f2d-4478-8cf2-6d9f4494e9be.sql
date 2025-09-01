-- Primeiro, renomear tabela profiles existente para user_profiles se existir
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles RENAME TO user_profiles;
  END IF;
END $$;

-- tabela principal
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('artista','local','organizador')),
  handle text NOT NULL UNIQUE,
  name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'BR',
  bio_short text NOT NULL DEFAULT '',
  bio text,
  avatar_url text,
  cover_url text,
  tags text[] DEFAULT '{}',
  links jsonb DEFAULT '[]',
  contact_email text,
  contact_phone text,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','draft','private')),
  verified boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- regras de handle
ALTER TABLE public.profiles
  ADD CONSTRAINT handle_format CHECK (handle ~ '^[a-z0-9.]{3,30}$');

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(lower(handle));

-- dados específicos em tabelas filhas
CREATE TABLE IF NOT EXISTS public.profile_artist (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  genres text[] NOT NULL DEFAULT '{}',
  agency text,
  touring_city text,
  fee_band text CHECK (fee_band IN ('<=2k','2-5k','5-10k','10k+')),
  rider_url text,
  stageplot_url text,
  presskit_url text,
  spotify_id text,
  soundcloud_url text,
  youtube_url text,
  pronoun text
);

CREATE TABLE IF NOT EXISTS public.profile_venue (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  address jsonb,
  lat numeric, 
  lon numeric,
  place_id text,
  capacity int NOT NULL,
  hours jsonb,
  price_range text CHECK (price_range IN ('$','$$','$$$')),
  accessibility jsonb,
  age_policy text NOT NULL,
  sound_gear jsonb,
  cnpj text
);

CREATE TABLE IF NOT EXISTS public.profile_org (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name text,
  cnpj text,
  manager_name text,
  manager_email text,
  manager_phone text,
  cities text[],
  about text
);

-- papéis
CREATE TABLE IF NOT EXISTS public.profile_roles (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, user_id)
);

-- seguidores
CREATE TABLE IF NOT EXISTS public.followers (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, user_id)
);

-- ao criar perfil, criador vira owner
CREATE OR REPLACE FUNCTION public.fn_profile_set_owner()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profile_roles(profile_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_profile_set_owner ON public.profiles;
CREATE TRIGGER trg_profile_set_owner
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_profile_set_owner();