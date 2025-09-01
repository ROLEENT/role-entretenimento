-- Configurar buckets de imagens no Supabase Storage

-- Criar buckets públicos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket avatars
-- Leitura pública
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Upload apenas para usuários autenticados (próprio profile)
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Atualizar apenas para usuários autenticados (próprio profile)
CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Deletar apenas para usuários autenticados (próprio profile)
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Políticas para bucket covers
-- Leitura pública
CREATE POLICY "Cover images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'covers');

-- Upload apenas para usuários autenticados (próprio profile)
CREATE POLICY "Users can upload their own cover" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Atualizar apenas para usuários autenticados (próprio profile)
CREATE POLICY "Users can update their own cover" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'covers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Deletar apenas para usuários autenticados (próprio profile)
CREATE POLICY "Users can delete their own cover" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'covers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);