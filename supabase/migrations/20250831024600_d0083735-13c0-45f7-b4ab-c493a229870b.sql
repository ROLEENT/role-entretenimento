-- Create storage bucket for agent avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agents', 'agents', true);

-- Create RLS policies for agent avatars
CREATE POLICY "Anyone can view agent avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agents');

CREATE POLICY "Authenticated users can upload agent avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update agent avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete agent avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'agents' AND auth.uid() IS NOT NULL);