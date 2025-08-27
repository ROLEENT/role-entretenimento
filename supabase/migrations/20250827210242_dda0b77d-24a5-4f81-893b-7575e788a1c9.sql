-- Create events storage bucket and RLS policies for admin access

-- Ensure we have the events bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for events bucket using admin session validation
CREATE POLICY "Admin users can upload event files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'events' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin users can view event files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'events' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin users can update event files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'events' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin users can delete event files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'events' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);