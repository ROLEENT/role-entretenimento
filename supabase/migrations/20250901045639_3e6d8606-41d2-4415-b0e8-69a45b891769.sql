-- Rename entity_profiles to profiles and add missing columns
ALTER TABLE public.entity_profiles RENAME TO profiles;

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public',
ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid(),
ADD COLUMN IF NOT EXISTS source_id uuid;

-- Add constraints (separate statements)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visibility_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT visibility_check CHECK (visibility IN ('public','draft','private'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'handle_format') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT handle_format CHECK (handle ~ '^[a-z0-9.]{3,30}$');
  END IF;
END $$;

-- Create unique index for handle (case insensitive)
DROP INDEX IF EXISTS idx_profiles_handle;
CREATE UNIQUE INDEX idx_profiles_handle ON public.profiles(lower(handle));

-- Create missing tables
CREATE TABLE IF NOT EXISTS public.followers (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, user_id)
);

-- Create storage buckets for avatars and covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-covers', 'profile-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on followers table
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS policies for followers
DROP POLICY IF EXISTS followers_read ON public.followers;
CREATE POLICY followers_read ON public.followers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS followers_manage ON public.followers;
CREATE POLICY followers_manage ON public.followers FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);