-- Create admin bucket for highlight covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin', 
  'admin', 
  true, 
  5242880, -- 5MB in bytes
  ARRAY['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
);

-- RLS policies for admin bucket
CREATE POLICY "Admin uploads allowed"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'admin' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Admin can view all files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'admin' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Admin can update own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'admin' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Admin can delete files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'admin' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Public access for published content (read-only)
CREATE POLICY "Public can view admin files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'admin');