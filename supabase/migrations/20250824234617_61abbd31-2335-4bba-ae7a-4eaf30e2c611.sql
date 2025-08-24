-- Fix storage RLS policies for highlights bucket

-- First, drop existing conflicting policies
DROP POLICY IF EXISTS "Admin users can upload highlights" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can view highlights" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update highlights" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete highlights" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view highlights images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage highlights images" ON storage.objects;

-- Create simplified storage policies for highlights bucket
-- Allow public viewing of highlights images
CREATE POLICY "Public can view highlights images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'highlights');

-- Allow admin users to upload highlights images
CREATE POLICY "Admins can upload highlights images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'highlights' 
  AND is_admin_session_valid((current_setting('request.headers', true)::json->>'x-admin-email'))
);

-- Allow admin users to update highlights images
CREATE POLICY "Admins can update highlights images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'highlights' 
  AND is_admin_session_valid((current_setting('request.headers', true)::json->>'x-admin-email'))
);

-- Allow admin users to delete highlights images
CREATE POLICY "Admins can delete highlights images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'highlights' 
  AND is_admin_session_valid((current_setting('request.headers', true)::json->>'x-admin-email'))
);