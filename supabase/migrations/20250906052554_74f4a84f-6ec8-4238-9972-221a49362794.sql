-- Just create saves table without policies first
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