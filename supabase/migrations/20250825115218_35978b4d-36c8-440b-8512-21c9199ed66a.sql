-- Criar bucket highlights se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('highlights', 'highlights', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Políticas RLS para o bucket highlights
-- Limpar políticas existentes
DROP POLICY IF EXISTS "Admins can upload highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete highlight images" ON storage.objects;

-- Política para upload (admins autenticados)
CREATE POLICY "Admins can upload highlight images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'highlights' 
  AND auth.uid() IS NOT NULL
);

-- Política para visualização pública
CREATE POLICY "Public can view highlight images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'highlights');

-- Política para atualização (admins autenticados)
CREATE POLICY "Admins can update highlight images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'highlights' 
  AND auth.uid() IS NOT NULL
);

-- Política para exclusão (admins autenticados)
CREATE POLICY "Admins can delete highlight images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'highlights' 
  AND auth.uid() IS NOT NULL
);