-- Create only the users_public table first
CREATE TABLE IF NOT EXISTS public.users_public (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username citext UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  city_preferences text[] DEFAULT '{}',
  genre_preferences text[] DEFAULT '{}',
  accessibility_notes text,
  is_profile_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on users_public
ALTER TABLE public.users_public ENABLE ROW LEVEL SECURITY;

-- Add basic index
CREATE INDEX IF NOT EXISTS idx_users_public_username ON public.users_public (username);