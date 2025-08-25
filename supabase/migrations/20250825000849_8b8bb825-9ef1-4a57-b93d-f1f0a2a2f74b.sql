-- Policies para o bucket blog-images

-- 1) Selecionar imagens publicamente
DROP POLICY IF EXISTS "public_select_blog_images" ON storage.objects;
CREATE POLICY "public_select_blog_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- 2) Upload por usuários autenticados
DROP POLICY IF EXISTS "auth_insert_blog_images" ON storage.objects;
CREATE POLICY "auth_insert_blog_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- 3) Atualizar e deletar só o dono do objeto
DROP POLICY IF EXISTS "owner_update_blog_images" ON storage.objects;
CREATE POLICY "owner_update_blog_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'blog-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "owner_delete_blog_images" ON storage.objects;
CREATE POLICY "owner_delete_blog_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND owner = auth.uid());