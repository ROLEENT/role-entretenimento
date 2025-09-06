-- Add is_active column to organizers table
ALTER TABLE public.organizers 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organizers_is_active ON public.organizers(is_active);

-- Update RLS policy to include is_active filter where needed
DROP POLICY IF EXISTS "Public can view active organizers" ON public.organizers;
CREATE POLICY "Public can view active organizers" 
ON public.organizers 
FOR SELECT 
USING (is_active = true);

-- Insert some example organizers if table is empty
INSERT INTO public.organizers (name, email, bio, city, is_active)
SELECT 
    'Coletivo Cultural SP', 
    'contato@coletivo.sp.com', 
    'Coletivo focado em eventos culturais e música eletrônica em São Paulo',
    'São Paulo',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.organizers LIMIT 1);

INSERT INTO public.organizers (name, email, bio, city, is_active)
SELECT 
    'Produtora Rock POA', 
    'eventos@rockpoa.com', 
    'Produtora especializada em shows de rock e eventos alternativos em Porto Alegre',
    'Porto Alegre',
    true
WHERE (SELECT COUNT(*) FROM public.organizers) < 2;

INSERT INTO public.organizers (name, email, bio, city, is_active)
SELECT 
    'RJ Music Events', 
    'contato@rjmusic.com', 
    'Organização de eventos musicais e festivais no Rio de Janeiro',
    'Rio de Janeiro',
    true
WHERE (SELECT COUNT(*) FROM public.organizers) < 3;