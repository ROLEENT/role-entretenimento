-- Create storage buckets for admin content management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('events', 'events', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('venues', 'venues', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('organizers', 'organizers', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('posts', 'posts', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create a helper function to validate admin file uploads
CREATE OR REPLACE FUNCTION public.validate_admin_file_upload(
  bucket_name TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN FALSE;
  END IF;
  
  -- Check if bucket is allowed
  IF bucket_name NOT IN ('events', 'venues', 'organizers', 'posts') THEN
    RETURN FALSE;
  END IF;
  
  -- Check file size (50MB limit)
  IF file_size > 52428800 THEN
    RETURN FALSE;
  END IF;
  
  -- Check mime type
  IF mime_type NOT IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;