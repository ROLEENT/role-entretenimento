-- Create highlights storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'highlights', 'highlights', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'highlights'
);

-- Create storage policies for highlights bucket
CREATE POLICY "Anyone can view highlight images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'highlights');

CREATE POLICY "Authenticated users can upload highlight images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'highlights' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own highlight images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'highlights' AND auth.uid() IS NOT NULL);