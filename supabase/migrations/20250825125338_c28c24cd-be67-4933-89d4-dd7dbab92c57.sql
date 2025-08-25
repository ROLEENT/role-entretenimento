-- Create storage policies for highlights bucket
INSERT INTO storage.buckets (id, name, public, allowed_mime_types) 
VALUES ('highlights', 'highlights', true, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = ARRAY['image/*'];

-- Create RLS policies for highlights storage
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'highlights' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to view images" ON storage.objects 
FOR SELECT USING (bucket_id = 'highlights');

CREATE POLICY "Allow authenticated users to update their uploads" ON storage.objects 
FOR UPDATE USING (bucket_id = 'highlights' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their uploads" ON storage.objects 
FOR DELETE USING (bucket_id = 'highlights' AND auth.role() = 'authenticated');