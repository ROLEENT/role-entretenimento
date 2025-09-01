-- RLS e grants
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_artist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_org ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Deletar policies existentes se houver para evitar conflito
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_read ON public.profiles;
  DROP POLICY IF EXISTS artist_read ON public.profile_artist;
  DROP POLICY IF EXISTS venue_read ON public.profile_venue;
  DROP POLICY IF EXISTS org_read ON public.profile_org;
  DROP POLICY IF EXISTS followers_read ON public.followers;
  DROP POLICY IF EXISTS roles_read ON public.profile_roles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- leitura pública
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY artist_read   ON public.profile_artist FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY venue_read    ON public.profile_venue  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY org_read      ON public.profile_org    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY followers_read ON public.followers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY roles_read ON public.profile_roles FOR SELECT TO authenticated USING (true);

-- criar perfil: usuário autenticado
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- editar perfil: owner ou editor
DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = id AND r.user_id = auth.uid()));

-- policies separadas para cada operação nas tabelas filhas
DROP POLICY IF EXISTS artist_insert ON public.profile_artist;
CREATE POLICY artist_insert ON public.profile_artist FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS artist_update ON public.profile_artist;
CREATE POLICY artist_update ON public.profile_artist FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS artist_delete ON public.profile_artist;
CREATE POLICY artist_delete ON public.profile_artist FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS venue_insert ON public.profile_venue;
CREATE POLICY venue_insert ON public.profile_venue FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS venue_update ON public.profile_venue;
CREATE POLICY venue_update ON public.profile_venue FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS venue_delete ON public.profile_venue;
CREATE POLICY venue_delete ON public.profile_venue FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS org_insert ON public.profile_org;
CREATE POLICY org_insert ON public.profile_org FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS org_update ON public.profile_org;
CREATE POLICY org_update ON public.profile_org FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS org_delete ON public.profile_org;
CREATE POLICY org_delete ON public.profile_org FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profile_roles r WHERE r.profile_id = profile_id AND r.user_id = auth.uid()));

-- follow e unfollow
DROP POLICY IF EXISTS followers_ins ON public.followers;
CREATE POLICY followers_ins ON public.followers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
  
DROP POLICY IF EXISTS followers_del ON public.followers;
CREATE POLICY followers_del ON public.followers FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- stats materializadas por view (ajustada para estrutura existente)
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT
  p.id as profile_id,
  COALESCE(f.cnt,0)::int as followers_count,
  0::int as upcoming_events_count -- eventos serão vinculados posteriormente
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT count(*) cnt FROM public.followers f WHERE f.profile_id = p.id
) f ON true;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;