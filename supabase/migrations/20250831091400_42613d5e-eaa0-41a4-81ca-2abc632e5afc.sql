-- Criar bucket para imagens dos artistas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-images', 'artist-images', true);

-- Políticas RLS para o bucket artist-images
CREATE POLICY "Qualquer um pode visualizar imagens de artistas"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-images');

CREATE POLICY "Usuários autenticados podem fazer upload de imagens de artistas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artist-images' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar imagens de artistas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'artist-images' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar imagens de artistas"
ON storage.objects FOR DELETE
USING (bucket_id = 'artist-images' AND auth.role() = 'authenticated');