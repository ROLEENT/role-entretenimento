-- Rename entity_profiles to profiles and add missing columns
ALTER TABLE public.entity_profiles RENAME TO profiles;

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid(),
ADD COLUMN IF NOT EXISTS source_id uuid;

-- Add constraints for visibility and handle format
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS visibility_check CHECK (visibility IN ('public','draft','private'));

ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS handle_format CHECK (handle ~ '^[a-z0-9.]{3,30}$');

-- Create unique index for handle (case insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(lower(handle));

-- Create missing tables
CREATE TABLE IF NOT EXISTS public.followers (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, user_id)
);

-- Update profile_stats view
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT
  p.id as profile_id,
  COALESCE(f.cnt, 0)::int as followers_count,
  COALESCE(e.cnt, 0)::int as upcoming_events_count
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT count(*) cnt FROM public.followers f WHERE f.profile_id = p.id
) f ON true
LEFT JOIN LATERAL (
  SELECT count(*) cnt
  FROM public.agenda_itens ev
  WHERE ev.id = p.id AND ev.starts_at >= now() AND ev.status = 'published'
) e ON true;

-- Create storage buckets for avatars and covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-covers', 'profile-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for covers
CREATE POLICY IF NOT EXISTS "Cover images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-covers');

CREATE POLICY IF NOT EXISTS "Users can upload their own cover" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own cover" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable RLS on followers table
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS policies for followers
CREATE POLICY followers_read ON public.followers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY followers_manage ON public.followers FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();