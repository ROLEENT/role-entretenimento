-- Create RLS policies for highlights table to allow admin access only
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admin can manage highlights" ON public.highlights;
DROP POLICY IF EXISTS "Anyone can view published highlights" ON public.highlights;

-- Create admin-only policies
CREATE POLICY "Admin can manage highlights" ON public.highlights 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Allow public to view published highlights
CREATE POLICY "Anyone can view published highlights" ON public.highlights 
FOR SELECT 
USING (is_published = true);