-- Add missing avatar storage policies
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Policy for users to view avatars publicly
DROP POLICY IF EXISTS "Avatars são publicamente visíveis" ON storage.objects;
CREATE POLICY "Avatars são publicamente visíveis" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- Policy for users to upload their own avatars
DROP POLICY IF EXISTS "Usuários podem enviar seus próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem enviar seus próprios avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Policy for users to delete their own avatars
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios avatars" ON storage.objects 
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);