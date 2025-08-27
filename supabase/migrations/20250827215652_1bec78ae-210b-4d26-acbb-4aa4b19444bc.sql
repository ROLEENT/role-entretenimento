-- Verificar e garantir que o bucket organizers existe e está público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('organizers', 'organizers', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Remover todas as políticas existentes do bucket organizers
DROP POLICY IF EXISTS "Admin can upload organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage organizer files" ON storage.objects;

-- Replicar EXATAMENTE as políticas do bucket highlights para organizers
-- 1. Política de visualização pública (igual aos highlights)
CREATE POLICY "Public can view organizer images"
ON storage.objects FOR SELECT
USING (bucket_id = 'organizers');

-- 2. Política de upload para admins (igual aos highlights)
CREATE POLICY "Admins can upload organizer images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organizers' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- 3. Política de update para admins (igual aos highlights)
CREATE POLICY "Admins can update organizer images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organizers' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- 4. Política de delete para admins (igual aos highlights)
CREATE POLICY "Admins can delete organizer images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organizers' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);