-- Create storage bucket for agenda images
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('agenda-images', 'agenda-images', true, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], 5242880);

-- Create RLS policies for agenda images bucket
CREATE POLICY "Anyone can view agenda images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agenda-images');

CREATE POLICY "Authenticated users can upload agenda images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agenda-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their uploaded agenda images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agenda-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their uploaded agenda images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'agenda-images' AND auth.uid() IS NOT NULL);