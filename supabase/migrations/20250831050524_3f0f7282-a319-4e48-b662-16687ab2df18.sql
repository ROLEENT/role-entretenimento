-- Criar tabela de países
CREATE TABLE IF NOT EXISTS public.countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
  flag_emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de estados/províncias
CREATE TABLE IF NOT EXISTS public.states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  code TEXT, -- código do estado (ex: SP, RJ)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_id, code)
);

-- Adicionar coluna country_id e state_id na tabela cities existente
ALTER TABLE public.cities 
ADD COLUMN IF NOT EXISTS country_id TEXT REFERENCES public.countries(id),
ADD COLUMN IF NOT EXISTS state_id TEXT REFERENCES public.states(id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_states_country_id ON public.states(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON public.cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON public.cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_uf ON public.cities(uf);

-- Inserir dados básicos do Brasil
INSERT INTO public.countries (id, name, code, flag_emoji) 
VALUES ('BR', 'Brasil', 'BR', '🇧🇷')
ON CONFLICT (id) DO NOTHING;

-- Inserir estados brasileiros
INSERT INTO public.states (id, name, country_id, code) VALUES
('BR-AC', 'Acre', 'BR', 'AC'),
('BR-AL', 'Alagoas', 'BR', 'AL'),
('BR-AP', 'Amapá', 'BR', 'AP'),
('BR-AM', 'Amazonas', 'BR', 'AM'),
('BR-BA', 'Bahia', 'BR', 'BA'),
('BR-CE', 'Ceará', 'BR', 'CE'),
('BR-DF', 'Distrito Federal', 'BR', 'DF'),
('BR-ES', 'Espírito Santo', 'BR', 'ES'),
('BR-GO', 'Goiás', 'BR', 'GO'),
('BR-MA', 'Maranhão', 'BR', 'MA'),
('BR-MT', 'Mato Grosso', 'BR', 'MT'),
('BR-MS', 'Mato Grosso do Sul', 'BR', 'MS'),
('BR-MG', 'Minas Gerais', 'BR', 'MG'),
('BR-PA', 'Pará', 'BR', 'PA'),
('BR-PB', 'Paraíba', 'BR', 'PB'),
('BR-PR', 'Paraná', 'BR', 'PR'),
('BR-PE', 'Pernambuco', 'BR', 'PE'),
('BR-PI', 'Piauí', 'BR', 'PI'),
('BR-RJ', 'Rio de Janeiro', 'BR', 'RJ'),
('BR-RN', 'Rio Grande do Norte', 'BR', 'RN'),
('BR-RS', 'Rio Grande do Sul', 'BR', 'RS'),
('BR-RO', 'Rondônia', 'BR', 'RO'),
('BR-RR', 'Roraima', 'BR', 'RR'),
('BR-SC', 'Santa Catarina', 'BR', 'SC'),
('BR-SP', 'São Paulo', 'BR', 'SP'),
('BR-SE', 'Sergipe', 'BR', 'SE'),
('BR-TO', 'Tocantins', 'BR', 'TO')
ON CONFLICT (id) DO NOTHING;

-- Atualizar cidades existentes para referenciar Brasil e mapear UF para state_id
UPDATE public.cities 
SET country_id = 'BR'
WHERE country_id IS NULL;

UPDATE public.cities 
SET state_id = 'BR-' || uf
WHERE state_id IS NULL AND uf IS NOT NULL;

-- RLS Policies para as novas tabelas
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

-- Políticas para visualização pública
CREATE POLICY "Anyone can view countries" ON public.countries
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view states" ON public.states
  FOR SELECT USING (true);

-- Políticas para admins gerenciarem
CREATE POLICY "Admins can manage countries" ON public.countries
  FOR ALL USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

CREATE POLICY "Admins can manage states" ON public.states
  FOR ALL USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_states_updated_at
  BEFORE UPDATE ON public.states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();