-- Add indexes first (these should work)
CREATE INDEX IF NOT EXISTS idx_saves_event ON public.saves (event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance (event_id);
CREATE INDEX IF NOT EXISTS idx_follows_user ON public.follows (user_id);
CREATE INDEX IF NOT EXISTS idx_follows_type_slug ON public.follows (entity_type, entity_slug) WHERE entity_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_follows_type_uuid ON public.follows (entity_type, entity_uuid) WHERE entity_uuid IS NOT NULL;