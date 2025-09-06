-- Add policy for follows table
CREATE POLICY follows_owner_all
  ON public.follows
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create saves table
CREATE TABLE IF NOT EXISTS public.saves (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  collection text NOT NULL DEFAULT 'default',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saves_user_event_unique UNIQUE (user_id, event_id, collection)
);

-- Enable RLS for saves
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Add policy for saves
CREATE POLICY saves_owner_all
  ON public.saves
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create attendance enum and table
DO $$ BEGIN
  CREATE TYPE public.attendance_status AS ENUM ('going','maybe','went');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.attendance (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  status public.attendance_status NOT NULL,
  show_publicly boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_user_event_unique UNIQUE (user_id, event_id)
);

-- Enable RLS for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Add policy for attendance
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