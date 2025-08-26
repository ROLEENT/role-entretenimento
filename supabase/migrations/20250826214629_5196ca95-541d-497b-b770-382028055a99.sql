-- FASE 1: Correção completa das políticas RLS para highlights

-- Verificar e criar bucket de storage para highlights se necessário
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('highlights', 'highlights', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remover políticas incorretas da tabela highlights
DROP POLICY IF EXISTS "Public can read publis" ON highlights;
DROP POLICY IF EXISTS "Public can read published highlights" ON highlights;
DROP POLICY IF EXISTS "Admins can manage highlights" ON highlights;

-- Criar políticas RLS corretas para highlights
CREATE POLICY "Anyone can view published highlights" 
ON highlights FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can view all highlights" 
ON highlights FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can create highlights" 
ON highlights FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update highlights" 
ON highlights FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete highlights" 
ON highlights FOR DELETE 
USING (is_admin());

-- Políticas para storage bucket highlights
CREATE POLICY "Public can view highlight images"
ON storage.objects FOR SELECT
USING (bucket_id = 'highlights');

CREATE POLICY "Admins can upload highlight images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'highlights' AND is_admin());

CREATE POLICY "Admins can update highlight images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'highlights' AND is_admin());

CREATE POLICY "Admins can delete highlight images"
ON storage.objects FOR DELETE
USING (bucket_id = 'highlights' AND is_admin());