-- Create RLS policies for agent avatars (bucket already exists)
DO $$ 
BEGIN
  -- Check if policies don't exist before creating them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can view agent avatars'
  ) THEN
    CREATE POLICY "Anyone can view agent avatars" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'agents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload agent avatars'
  ) THEN
    CREATE POLICY "Authenticated users can upload agent avatars" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'agents' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can update agent avatars'
  ) THEN
    CREATE POLICY "Authenticated users can update agent avatars" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'agents' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can delete agent avatars'
  ) THEN
    CREATE POLICY "Authenticated users can delete agent avatars" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'agents' AND auth.uid() IS NOT NULL);
  END IF;
END $$;