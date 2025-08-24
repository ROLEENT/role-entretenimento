-- Create storage buckets for partner logos and advertisement banners
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('partner-logos', 'partner-logos', true),
  ('ads-banners', 'ads-banners', true);

-- Create policies for partner logos bucket
CREATE POLICY "Partner logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'partner-logos');

CREATE POLICY "Admins can upload partner logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'partner-logos' AND is_admin_user());

CREATE POLICY "Admins can update partner logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'partner-logos' AND is_admin_user());

CREATE POLICY "Admins can delete partner logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'partner-logos' AND is_admin_user());

-- Create policies for ads banners bucket
CREATE POLICY "Ads banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ads-banners');

CREATE POLICY "Admins can upload ads banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ads-banners' AND is_admin_user());

CREATE POLICY "Admins can update ads banners" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ads-banners' AND is_admin_user());

CREATE POLICY "Admins can delete ads banners" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ads-banners' AND is_admin_user());