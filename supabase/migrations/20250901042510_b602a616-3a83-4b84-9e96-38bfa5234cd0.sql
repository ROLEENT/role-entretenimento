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
  address jsonb,           -- rua, numero, bairro, cep
  lat numeric, lon numeric,
  place_id text,
  capacity int NOT NULL,
  hours jsonb,             -- por dia da semana
  price_range text CHECK (price_range IN ('$','$$','$$$')),
  accessibility jsonb,     -- rampas, banheiro, etc
  age_policy text NOT NULL, -- ex 18+
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

-- stats materializadas por view
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT
  p.id as profile_id,
  COALESCE(f.cnt,0)::int as followers_count,
  COALESCE(e.cnt,0)::int as upcoming_events_count
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT count(*) cnt FROM public.followers f WHERE f.profile_id = p.id
) f ON true
LEFT JOIN LATERAL (
  SELECT count(*) cnt
  FROM public.events ev
  WHERE ev.profile_id = p.id AND ev.starts_at >= now()
) e ON true;

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

-- RLS e grants
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_artist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_org ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- leitura pública
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY artist_read   ON public.profile_artist FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY venue_read    ON public.profile_venue  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY org_read      ON public.profile_org    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY followers_read ON public.followers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY roles_read ON public.profile_roles FOR SELECT TO authenticated USING (true);

-- criar perfil: usuário autenticado
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- editar perfil: owner ou editor
CREATE POLICY profiles_update ON public.profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()));

-- update nas tabelas filhas pelo mesmo critério
CREATE POLICY artist_upd ON public.profile_artist FOR INSERT, UPDATE, DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

CREATE POLICY venue_upd ON public.profile_venue FOR INSERT, UPDATE, DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

CREATE POLICY org_upd ON public.profile_org FOR INSERT, UPDATE, DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

-- follow e unfollow
CREATE POLICY followers_ins ON public.followers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY followers_del ON public.followers FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;