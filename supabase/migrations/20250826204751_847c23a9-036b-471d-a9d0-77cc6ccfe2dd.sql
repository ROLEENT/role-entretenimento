-- Create storage buckets for admin content management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('events', 'events', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('venues', 'venues', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('organizers', 'organizers', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('posts', 'posts', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage.objects

-- Public read access for all buckets
CREATE POLICY "Public can view all uploaded files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('events', 'venues', 'organizers', 'posts'));

-- Admin-only write access using is_admin() function
CREATE POLICY "Admins can upload to events bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events' AND 
  is_admin()
);

CREATE POLICY "Admins can upload to venues bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'venues' AND 
  is_admin()
);

CREATE POLICY "Admins can upload to organizers bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organizers' AND 
  is_admin()
);

CREATE POLICY "Admins can upload to posts bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND 
  is_admin()
);

-- Admin-only update/delete access
CREATE POLICY "Admins can update files in admin buckets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('events', 'venues', 'organizers', 'posts') AND 
  is_admin()
);

CREATE POLICY "Admins can delete files in admin buckets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('events', 'venues', 'organizers', 'posts') AND 
  is_admin()
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;