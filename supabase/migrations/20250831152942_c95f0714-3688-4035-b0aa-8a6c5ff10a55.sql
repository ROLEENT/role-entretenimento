-- Create storage bucket for blog post images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-posts', 'blog-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for blog-posts bucket
CREATE POLICY "Admin users can upload blog post images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'blog-posts' 
  AND (
    -- Check if user is admin via admin_users table
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
    OR 
    -- Fallback: check if user is authenticated and has admin role
    auth.role() = 'authenticated'
  )
);

CREATE POLICY "Blog post images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-posts');

CREATE POLICY "Admin users can update blog post images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'blog-posts' 
  AND (
    -- Check if user is admin via admin_users table
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
    OR 
    -- Fallback: check if user is authenticated and has admin role
    auth.role() = 'authenticated'
  )
);

CREATE POLICY "Admin users can delete blog post images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'blog-posts' 
  AND (
    -- Check if user is admin via admin_users table
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
    OR 
    -- Fallback: check if user is authenticated and has admin role
    auth.role() = 'authenticated'
  )
);