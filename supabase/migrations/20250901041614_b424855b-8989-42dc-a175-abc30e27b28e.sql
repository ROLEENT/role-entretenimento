-- Ensure storage buckets exist for artists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('artists', 'artists', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('organizers', 'organizers', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('venues', 'venues', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create RLS policies for artist images
CREATE POLICY "Allow public read access to artist images" ON storage.objects
FOR SELECT USING (bucket_id = 'artists');

CREATE POLICY "Allow authenticated users to upload artist images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'artists' AND 
  (auth.role() = 'authenticated' OR 
   EXISTS (SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true))
);

CREATE POLICY "Allow authenticated users to update artist images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'artists' AND 
  (auth.role() = 'authenticated' OR 
   EXISTS (SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true))
);

CREATE POLICY "Allow authenticated users to delete artist images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'artists' AND 
  (auth.role() = 'authenticated' OR 
   EXISTS (SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true))
);

-- Similar policies for organizers bucket
CREATE POLICY "Allow public read access to organizer images" ON storage.objects
FOR SELECT USING (bucket_id = 'organizers');

CREATE POLICY "Allow authenticated users to upload organizer images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'organizers' AND 
  (auth.role() = 'authenticated' OR 
   EXISTS (SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true))
);

-- Similar policies for venues bucket
CREATE POLICY "Allow public read access to venue images" ON storage.objects
FOR SELECT USING (bucket_id = 'venues');

CREATE POLICY "Allow authenticated users to upload venue images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'venues' AND 
  (auth.role() = 'authenticated' OR 
   EXISTS (SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true))
);