-- Create follows table only
CREATE TABLE IF NOT EXISTS public.follows (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('artist','venue','organizer','city','tag')),
  entity_uuid uuid,
  entity_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follows_entity_presence CHECK (
    (entity_type IN ('artist','venue','organizer') AND entity_uuid IS NOT NULL AND entity_slug IS NULL)
    OR
    (entity_type IN ('city','tag') AND entity_slug IS NOT NULL AND entity_uuid IS NULL)
  )
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;