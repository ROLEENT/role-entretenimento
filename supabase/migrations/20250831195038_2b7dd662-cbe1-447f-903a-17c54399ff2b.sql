-- Verificar políticas atuais do bucket venues
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%venues%' OR policyname LIKE '%venue%';

-- Criar políticas RLS específicas para o bucket venues
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Venue images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload venue images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload venue images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update venue images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete venue images" ON storage.objects;

-- Política para visualização pública de imagens de venues
CREATE POLICY "Venue images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'venues');

-- Política para admins fazerem upload de imagens de venues
CREATE POLICY "Admins can upload venue images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'venues' AND 
  (
    is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) OR
    auth.uid() IS NOT NULL
  )
);

-- Política para admins atualizarem imagens de venues
CREATE POLICY "Admins can update venue images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'venues' AND 
  (
    is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) OR
    auth.uid() IS NOT NULL
  )
);

-- Política para admins deletarem imagens de venues
CREATE POLICY "Admins can delete venue images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'venues' AND 
  (
    is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')) OR
    auth.uid() IS NOT NULL
  )
);

-- Verificar se o bucket venues existe e está configurado corretamente
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'venues';