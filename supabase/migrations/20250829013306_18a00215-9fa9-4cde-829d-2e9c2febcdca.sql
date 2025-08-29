-- Create admin bucket for highlight covers (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin', 
  'admin', 
  true, 
  5242880, -- 5MB in bytes
  ARRAY['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

-- Ensure public read access exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public admin read access'
  ) THEN
    CREATE POLICY "Public admin read access"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'admin');
  END IF;
END $$;