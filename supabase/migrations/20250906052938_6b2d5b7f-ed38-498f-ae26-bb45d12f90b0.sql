-- Add policies one by one for existing tables
CREATE POLICY follows_owner_all
  ON public.follows
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());