-- Create RLS policies for venues storage bucket
CREATE POLICY "Admin can view venue files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'venues' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can upload venue files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'venues' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can update venue files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'venues' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can delete venue files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'venues' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- Create RLS policies for organizers storage bucket
CREATE POLICY "Admin can view organizer files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'organizers' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can upload organizer files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'organizers' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can update organizer files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'organizers' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can delete organizer files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'organizers' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);