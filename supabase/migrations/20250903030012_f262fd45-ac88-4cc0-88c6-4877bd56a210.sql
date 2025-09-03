-- Create storage bucket for organizers if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organizers', 'organizers', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for organizer uploads
CREATE POLICY "Organizer images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'organizers');

CREATE POLICY "Admins can upload organizer images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'organizers' 
  AND (EXISTS ( SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true ))
);

CREATE POLICY "Admins can update organizer images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'organizers'
  AND (EXISTS ( SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true ))
);

CREATE POLICY "Admins can delete organizer images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'organizers'
  AND (EXISTS ( SELECT 1 FROM admin_users WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true ))
);