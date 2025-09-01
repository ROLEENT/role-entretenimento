-- Criar esquema de perfis com seguidores e papéis
-- Trabalhando com a tabela profiles existente

-- Primeiro, vamos verificar e ajustar a tabela profiles existente
-- Adicionar colunas necessárias se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS handle text,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public',
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bio_short text DEFAULT '',
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS created_by uuid,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'BR';

-- Adicionar constraints se não existirem
DO $$ 
BEGIN
  -- Adicionar constraint para type se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_type_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_type_check 
    CHECK (type IN ('artista','local','organizador'));
  END IF;

  -- Adicionar constraint para visibility se não existir  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_visibility_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_visibility_check 
    CHECK (visibility IN ('public','draft','private'));
  END IF;

  -- Adicionar constraint para handle format se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'handle_format' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT handle_format 
    CHECK (handle ~ '^[a-z0-9.]{3,30}$');
  END IF;
END $$;

-- Criar índice único para handle se não existir
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(lower(handle));

-- Tornar handle único se ainda não for
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_handle_key' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_handle_key UNIQUE (handle);
  END IF;
END $$;

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
  lat numeric, 
  lon numeric,
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

-- stats materializadas por view (sem eventos por enquanto)
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT
  p.id as profile_id,
  COALESCE(f.cnt,0)::int as followers_count,
  0::int as upcoming_events_count  -- placeholder por enquanto
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT count(*) cnt FROM public.followers f WHERE f.profile_id = p.id
) f ON true;

-- ao criar perfil, criador vira owner
CREATE OR REPLACE FUNCTION public.fn_profile_set_owner()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profile_roles(profile_id, user_id, role)
  VALUES (NEW.id, COALESCE(NEW.created_by, auth.uid()), 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_profile_set_owner ON public.profiles;
CREATE TRIGGER trg_profile_set_owner
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_profile_set_owner();

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.profile_artist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_org ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública para as novas tabelas
DROP POLICY IF EXISTS artist_read ON public.profile_artist;
CREATE POLICY artist_read ON public.profile_artist FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS venue_read ON public.profile_venue;
CREATE POLICY venue_read ON public.profile_venue FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS org_read ON public.profile_org;
CREATE POLICY org_read ON public.profile_org FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS followers_read ON public.followers;
CREATE POLICY followers_read ON public.followers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS roles_read ON public.profile_roles;
CREATE POLICY roles_read ON public.profile_roles FOR SELECT TO authenticated USING (true);

-- Políticas de edição: owner ou editor
DROP POLICY IF EXISTS artist_upd ON public.profile_artist;
CREATE POLICY artist_upd ON public.profile_artist FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS venue_upd ON public.profile_venue;
CREATE POLICY venue_upd ON public.profile_venue FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS org_upd ON public.profile_org;
CREATE POLICY org_upd ON public.profile_org FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

-- follow e unfollow
DROP POLICY IF EXISTS followers_ins ON public.followers;
CREATE POLICY followers_ins ON public.followers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS followers_del ON public.followers;
CREATE POLICY followers_del ON public.followers FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Política para permitir criação de perfis por usuários autenticados
DROP POLICY IF EXISTS profiles_new_insert ON public.profiles;
CREATE POLICY profiles_new_insert ON public.profiles FOR INSERT TO authenticated 
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- Política para permitir edição de perfis por owners/editors
DROP POLICY IF EXISTS profiles_new_update ON public.profiles;
CREATE POLICY profiles_new_update ON public.profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()));

-- grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;