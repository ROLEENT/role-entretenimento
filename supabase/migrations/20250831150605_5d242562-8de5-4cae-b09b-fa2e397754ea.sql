-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', false);

-- Create policies for backup storage
CREATE POLICY "Admins can upload backups" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'backups' AND 
  (auth.role() = 'service_role' OR 
   EXISTS (
     SELECT 1 FROM public.admin_users 
     WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
     AND is_active = true
   ))
);

CREATE POLICY "Admins can download backups" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'backups' AND 
  (auth.role() = 'service_role' OR 
   EXISTS (
     SELECT 1 FROM public.admin_users 
     WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
     AND is_active = true
   ))
);

CREATE POLICY "Admins can delete backups" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'backups' AND 
  (auth.role() = 'service_role' OR 
   EXISTS (
     SELECT 1 FROM public.admin_users 
     WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
     AND is_active = true
   ))
);