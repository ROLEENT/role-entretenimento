-- Criar nova estrutura de perfis
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
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Regras de handle
ALTER TABLE public.profiles
  ADD CONSTRAINT handle_format CHECK (handle ~ '^[a-z0-9.]{3,30}$');

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(lower(handle));

-- Tabelas filhas para dados específicos
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

-- Tabela de papéis
CREATE TABLE IF NOT EXISTS public.profile_roles (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, user_id)
);

-- Migrar dados existentes de entity_profiles para profiles
INSERT INTO public.profiles (
  id, type, handle, name, city, state, country, bio_short, bio, 
  avatar_url, cover_url, tags, visibility, verified, user_id, created_at
)
SELECT 
  id, type, handle, name, city, 
  COALESCE(state, ''), COALESCE(country, 'BR'), 
  COALESCE(bio_short, ''), bio, avatar_url, cover_url, 
  COALESCE(tags, '{}'), COALESCE(visibility, 'public'), 
  COALESCE(verified, false), user_id, created_at
FROM public.entity_profiles
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = entity_profiles.id);

-- Migrar dados específicos para tabelas filhas
INSERT INTO public.profile_artist (profile_id)
SELECT id FROM public.profiles WHERE type = 'artista'
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.profile_venue (profile_id, capacity, age_policy)
SELECT id, COALESCE(50, 50), COALESCE('18+', '18+') 
FROM public.profiles WHERE type = 'local'
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.profile_org (profile_id)
SELECT id FROM public.profiles WHERE type = 'organizador'
ON CONFLICT (profile_id) DO NOTHING;

-- View de estatísticas
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT
  p.id as profile_id,
  COALESCE(f.cnt,0)::int as followers_count,
  0::int as upcoming_events_count,
  0::numeric as rating_avg
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT count(*) cnt FROM public.followers f WHERE f.profile_id = p.id
) f ON true;

-- Função para definir owner ao criar perfil
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

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_artist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_org ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY artist_read ON public.profile_artist FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY venue_read ON public.profile_venue FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY org_read ON public.profile_org FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY roles_read ON public.profile_roles FOR SELECT TO authenticated USING (true);

-- Criar perfil: usuário autenticado
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

-- Editar perfil: owner ou editor
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()));

-- Políticas para tabelas filhas
CREATE POLICY artist_manage ON public.profile_artist FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

CREATE POLICY venue_manage ON public.profile_venue FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

CREATE POLICY org_manage ON public.profile_org FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-avatars', 'profile-avatars', true),
  ('profile-covers', 'profile-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public avatar access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their avatars" ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public cover access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-covers');
CREATE POLICY "Authenticated users can upload covers" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-covers' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their covers" ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-covers' AND auth.uid() IS NOT NULL);