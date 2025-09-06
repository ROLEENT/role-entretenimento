-- Add RLS policies for users_public
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

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT false,
  notification_topics text[] NOT NULL DEFAULT '{}'
);

-- Enable RLS and add policies for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_prefs_select_self
  ON public.user_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY user_prefs_upsert_self
  ON public.user_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());