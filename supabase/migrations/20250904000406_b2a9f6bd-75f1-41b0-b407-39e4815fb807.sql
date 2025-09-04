-- Ensure venues table has RLS enabled and public read access
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS venues_select_public ON public.venues;

-- Create policy for public read access to venues
CREATE POLICY venues_select_public ON public.venues 
FOR SELECT TO anon 
USING (true);