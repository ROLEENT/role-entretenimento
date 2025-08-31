-- Setup complete Storage system for file uploads (fixing existing buckets)

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('highlights', 'highlights', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('artist-images', 'artist-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('venues', 'venues', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('ads', 'ads', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can view highlights images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload highlights images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update highlights images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete highlights images" ON storage.objects;

-- RLS Policies for highlights bucket
CREATE POLICY "Public access highlights images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'highlights');

CREATE POLICY "Admin manage highlights images" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- RLS Policies for avatars bucket (if not exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public access avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Public access avatars" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'avatars');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Users manage own avatars" 
    ON storage.objects 
    FOR ALL 
    USING (
      bucket_id = 'avatars' AND 
      (auth.uid()::text = (storage.foldername(name))[1] OR 
       EXISTS (
         SELECT 1 FROM public.admin_users 
         WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
         AND is_active = true
       ))
    )
    WITH CHECK (
      bucket_id = 'avatars' AND 
      (auth.uid()::text = (storage.foldername(name))[1] OR 
       EXISTS (
         SELECT 1 FROM public.admin_users 
         WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
         AND is_active = true
       ))
    );
  END IF;
END $$;

-- RLS Policies for agenda-images bucket
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public access agenda images' AND tablename = 'objects') THEN
    CREATE POLICY "Public access agenda images" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'agenda-images');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage agenda images' AND tablename = 'objects') THEN
    CREATE POLICY "Admin manage agenda images" 
    ON storage.objects 
    FOR ALL 
    USING (
      bucket_id = 'agenda-images' AND 
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
        AND is_active = true
      )
    )
    WITH CHECK (
      bucket_id = 'agenda-images' AND 
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
        AND is_active = true
      )
    );
  END IF;
END $$;

-- RLS Policies for other buckets
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public access artist images' AND tablename = 'objects') THEN
    CREATE POLICY "Public access artist images" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'artist-images');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage artist images' AND tablename = 'objects') THEN
    CREATE POLICY "Admin manage artist images" 
    ON storage.objects 
    FOR ALL 
    USING (
      bucket_id = 'artist-images' AND 
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
        AND is_active = true
      )
    )
    WITH CHECK (
      bucket_id = 'artist-images' AND 
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
        AND is_active = true
      )
    );
  END IF;
END $$;