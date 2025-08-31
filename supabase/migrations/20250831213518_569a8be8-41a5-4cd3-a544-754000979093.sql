-- Apply RLS policy to agenda_itens table for public reading access
ALTER TABLE public.agenda_itens ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS agenda_read_published ON public.agenda_itens;

-- Create policy to allow public and authenticated users to read published agenda items
CREATE POLICY agenda_read_published
ON public.agenda_itens
FOR SELECT
TO anon, authenticated
USING (status = 'published' AND deleted_at IS NULL);