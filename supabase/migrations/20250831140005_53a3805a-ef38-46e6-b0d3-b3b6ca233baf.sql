-- Setup complete Storage system for file uploads

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('highlights', 'highlights', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('agenda-images', 'agenda-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('artist-images', 'artist-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('venues', 'venues', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('ads', 'ads', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for highlights bucket
CREATE POLICY "Public can view highlights images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'highlights');

CREATE POLICY "Admins can upload highlights images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Admins can update highlights images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Admins can delete highlights images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- RLS Policies for agenda-images bucket
CREATE POLICY "Public can view agenda images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agenda-images');

CREATE POLICY "Admins can manage agenda images" 
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

-- RLS Policies for avatars bucket
CREATE POLICY "Public can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for artist-images bucket
CREATE POLICY "Public can view artist images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artist-images');

CREATE POLICY "Admins can manage artist images" 
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

-- RLS Policies for venues bucket
CREATE POLICY "Public can view venue images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'venues');

CREATE POLICY "Admins can manage venue images" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'venues' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  bucket_id = 'venues' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- RLS Policies for blog-images bucket
CREATE POLICY "Public can view blog images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can manage blog images" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'blog-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  bucket_id = 'blog-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- RLS Policies for ads bucket
CREATE POLICY "Public can view ads images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ads');

CREATE POLICY "Admins can manage ads images" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'ads' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  bucket_id = 'ads' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);