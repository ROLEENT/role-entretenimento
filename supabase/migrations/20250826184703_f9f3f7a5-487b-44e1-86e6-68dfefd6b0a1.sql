-- Create storage bucket for organizer logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('organizers', 'organizers', true);

-- Create RLS policies for organizers table
CREATE POLICY "read organizers"
ON public.organizers FOR SELECT
USING (true);

CREATE POLICY "admin write organizers"
ON public.organizers FOR ALL
USING (EXISTS(
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.is_admin = true
))
WITH CHECK (EXISTS(
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.is_admin = true
));

-- Create storage policies for organizer logos
CREATE POLICY "Anyone can view organizer logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organizers');

CREATE POLICY "Admins can upload organizer logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organizers' AND
  EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);

CREATE POLICY "Admins can update organizer logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organizers' AND
  EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);

CREATE POLICY "Admins can delete organizer logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organizers' AND
  EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);