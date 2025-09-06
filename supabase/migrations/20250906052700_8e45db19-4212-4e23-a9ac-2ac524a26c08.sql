-- Add all the policies for the tables
CREATE POLICY follows_owner_all
  ON public.follows
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY saves_owner_all
  ON public.saves
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY attendance_owner_all
  ON public.attendance
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add all indexes
CREATE INDEX IF NOT EXISTS idx_saves_event ON public.saves (event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance (event_id);
CREATE INDEX IF NOT EXISTS idx_follows_user ON public.follows (user_id);
CREATE INDEX IF NOT EXISTS idx_follows_type_slug ON public.follows (entity_type, entity_slug) WHERE entity_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_follows_type_uuid ON public.follows (entity_type, entity_uuid) WHERE entity_uuid IS NOT NULL;

-- Add unique constraint for follows (using a function-based index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_user_entity_unique 
ON public.follows (user_id, entity_type, COALESCE(entity_uuid::text, entity_slug));