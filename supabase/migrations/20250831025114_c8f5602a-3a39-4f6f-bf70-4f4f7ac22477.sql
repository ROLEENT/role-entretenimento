-- Update venues table structure for complete venue management
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS about TEXT;

-- Create venues storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('venues', 'venues', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for venues bucket
DO $$
BEGIN
  -- Policy for public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Venues images are publicly accessible'
  ) THEN
    CREATE POLICY "Venues images are publicly accessible" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'venues');
  END IF;

  -- Policy for authenticated users to upload venue images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload venue images'
  ) THEN
    CREATE POLICY "Authenticated users can upload venue images" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'venues' AND auth.uid() IS NOT NULL);
  END IF;

  -- Policy for authenticated users to update venue images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update venue images'
  ) THEN
    CREATE POLICY "Authenticated users can update venue images" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'venues' AND auth.uid() IS NOT NULL);
  END IF;

  -- Policy for authenticated users to delete venue images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete venue images'
  ) THEN
    CREATE POLICY "Authenticated users can delete venue images" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'venues' AND auth.uid() IS NOT NULL);
  END IF;
END $$;