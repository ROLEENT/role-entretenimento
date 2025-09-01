-- Adicionar apenas as colunas que estão faltando sem alterar starts_at
ALTER TABLE public.agenda_itens 
ADD COLUMN IF NOT EXISTS lineup_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';

-- Criar índices para melhor performance nas colunas existentes
CREATE INDEX IF NOT EXISTS idx_agenda_itens_status ON public.agenda_itens(status);
CREATE INDEX IF NOT EXISTS idx_agenda_itens_city ON public.agenda_itens(city);
CREATE INDEX IF NOT EXISTS idx_agenda_itens_starts_at ON public.agenda_itens(starts_at);
CREATE INDEX IF NOT EXISTS idx_agenda_itens_created_at ON public.agenda_itens(created_at);

-- Criar tabela para cidades se não existir
CREATE TABLE IF NOT EXISTS public.agenda_cities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  uf text,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir algumas cidades padrão se não existirem
INSERT INTO public.agenda_cities (name, slug, uf) VALUES
  ('São Paulo', 'sao-paulo', 'SP'),
  ('Rio de Janeiro', 'rio-de-janeiro', 'RJ'),
  ('Belo Horizonte', 'belo-horizonte', 'MG'),
  ('Brasília', 'brasilia', 'DF'),
  ('Salvador', 'salvador', 'BA'),
  ('Fortaleza', 'fortaleza', 'CE'),
  ('Recife', 'recife', 'PE'),
  ('Porto Alegre', 'porto-alegre', 'RS'),
  ('Curitiba', 'curitiba', 'PR'),
  ('Goiânia', 'goiania', 'GO')
ON CONFLICT (name) DO NOTHING;

-- RLS policies para agenda_cities
ALTER TABLE public.agenda_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities" ON public.agenda_cities
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage cities" ON public.agenda_cities
  FOR ALL USING (auth_role() = ANY (ARRAY['admin'::text, 'editor'::text]));