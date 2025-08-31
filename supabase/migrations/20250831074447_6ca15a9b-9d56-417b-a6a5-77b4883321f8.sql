-- Primeiro, vamos verificar se a tabela agenda_itens está adequada para nosso formulário
-- e garantir que todas as colunas necessárias existem

-- Adicionar colunas que podem estar faltando para corresponder ao schema EventForm
ALTER TABLE public.agenda_itens 
ADD COLUMN IF NOT EXISTS lineup_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';

-- Atualizar a tabela para ter mais flexibilidade nas datas
ALTER TABLE public.agenda_itens 
ALTER COLUMN starts_at TYPE timestamp with time zone,
ALTER COLUMN end_at TYPE timestamp with time zone;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agenda_itens_status ON public.agenda_itens(status);
CREATE INDEX IF NOT EXISTS idx_agenda_itens_city ON public.agenda_itens(city);
CREATE INDEX IF NOT EXISTS idx_agenda_itens_starts_at ON public.agenda_itens(starts_at);
CREATE INDEX IF NOT EXISTS idx_agenda_itens_created_at ON public.agenda_itens(created_at);

-- Função para validar datas
CREATE OR REPLACE FUNCTION validate_agenda_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que end_at é posterior a starts_at
  IF NEW.end_at IS NOT NULL AND NEW.starts_at IS NOT NULL THEN
    IF NEW.end_at <= NEW.starts_at THEN
      RAISE EXCEPTION 'Data de fim deve ser posterior à data de início';
    END IF;
  END IF;
  
  -- Se o status for published, starts_at é obrigatório
  IF NEW.status = 'published' AND NEW.starts_at IS NULL THEN
    RAISE EXCEPTION 'Data de início é obrigatória para eventos publicados';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação de datas
DROP TRIGGER IF EXISTS validate_agenda_dates_trigger ON public.agenda_itens;
CREATE TRIGGER validate_agenda_dates_trigger
  BEFORE INSERT OR UPDATE ON public.agenda_itens
  FOR EACH ROW
  EXECUTE FUNCTION validate_agenda_dates();

-- Garantir que cities table existe para os selects
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