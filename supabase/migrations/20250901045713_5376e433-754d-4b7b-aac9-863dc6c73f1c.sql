-- Just add the missing followers table and storage setup since profiles already exists
-- The entity_profiles table already exists and has the right structure

-- Create followers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.followers (
  profile_id uuid REFERENCES public.entity_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, user_id)
);

-- Add missing columns to entity_profiles if needed
ALTER TABLE public.entity_profiles 
ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public',
ADD COLUMN IF NOT EXISTS source_id uuid;

-- Create storage buckets for avatars and covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-covers', 'profile-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for covers
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
CREATE POLICY "Cover images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-covers');

DROP POLICY IF EXISTS "Users can upload their own cover" ON storage.objects;
CREATE POLICY "Users can upload their own cover" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable RLS on followers table
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS policies for followers
DROP POLICY IF EXISTS followers_read ON public.followers;
CREATE POLICY followers_read ON public.followers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS followers_manage ON public.followers;
CREATE POLICY followers_manage ON public.followers FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);