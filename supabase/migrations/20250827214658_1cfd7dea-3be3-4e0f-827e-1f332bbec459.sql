-- Remover políticas antigas do bucket organizers
DROP POLICY IF EXISTS "Admins can upload organizer logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update organizer logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete organizer logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view organizer logos" ON storage.objects;

-- Criar políticas padronizadas para o bucket organizers usando is_admin_session_valid
CREATE POLICY "Admin can upload organizer files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'organizers' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can update organizer files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'organizers' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Admin can delete organizer files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'organizers' AND 
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

CREATE POLICY "Anyone can view organizer files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'organizers');