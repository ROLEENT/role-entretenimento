-- Create storage policies for events bucket
CREATE POLICY "Public can view event images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'events');

CREATE POLICY "Admins can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'events' AND 
  (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ))
);

CREATE POLICY "Admins can update event images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'events' AND 
  (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ))
);

CREATE POLICY "Admins can delete event images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'events' AND 
  (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ))
);