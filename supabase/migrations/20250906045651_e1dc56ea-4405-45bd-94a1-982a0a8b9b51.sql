-- Ativar RLS
ALTER TABLE public.users_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies users_public
CREATE POLICY users_public_select_self_or_public
  ON public.users_public
  FOR SELECT
  USING (
    is_profile_public = true
    OR id = auth.uid()
  );

CREATE POLICY users_public_insert_self
  ON public.users_public
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY users_public_update_self
  ON public.users_public
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY users_public_delete_self
  ON public.users_public
  FOR DELETE
  USING (id = auth.uid());

-- Policies user_preferences
CREATE POLICY user_prefs_select_self
  ON public.user_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY user_prefs_upsert_self
  ON public.user_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies follows
CREATE POLICY follows_owner_all
  ON public.follows
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies saves
CREATE POLICY saves_owner_all
  ON public.saves
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies attendance
CREATE POLICY attendance_owner_all
  ON public.attendance
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());