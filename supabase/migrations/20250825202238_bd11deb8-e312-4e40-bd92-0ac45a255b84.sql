-- Add missing avatar storage policies
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Policy for users to view their own avatars and public avatars
CREATE POLICY IF NOT EXISTS "Avatars são publicamente visíveis" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- Policy for users to upload their own avatars
CREATE POLICY IF NOT EXISTS "Usuários podem enviar seus próprios avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Policy for users to delete their own avatars
CREATE POLICY IF NOT EXISTS "Usuários podem deletar seus próprios avatars" ON storage.objects 
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);