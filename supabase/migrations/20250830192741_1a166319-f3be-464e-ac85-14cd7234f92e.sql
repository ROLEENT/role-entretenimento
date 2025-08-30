-- Create cities table with proper structure
CREATE TABLE IF NOT EXISTS public.cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  uf TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view cities" 
ON public.cities 
FOR SELECT 
USING (true);

-- Insert initial cities data
INSERT INTO public.cities (name, uf, slug) VALUES
  ('São Paulo', 'SP', 'sao-paulo'),
  ('Rio de Janeiro', 'RJ', 'rio-de-janeiro'),
  ('Belo Horizonte', 'MG', 'belo-horizonte'),
  ('Brasília', 'DF', 'brasilia'),
  ('Porto Alegre', 'RS', 'porto-alegre'),
  ('Curitiba', 'PR', 'curitiba'),
  ('Florianópolis', 'SC', 'florianopolis'),
  ('Salvador', 'BA', 'salvador'),
  ('Recife', 'PE', 'recife'),
  ('Fortaleza', 'CE', 'fortaleza'),
  ('Goiânia', 'GO', 'goiania'),
  ('Manaus', 'AM', 'manaus')
ON CONFLICT (slug) DO NOTHING;

-- Add updated_at trigger
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();