-- ETAPA 1: Corrigir RLS crítico - Versão simplificada

-- Habilitar RLS nas tabelas essenciais
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Política simples para venues (público pode ver)
CREATE POLICY "Anyone can view venues" 
ON public.venues 
FOR SELECT 
USING (true);

-- Política simples para organizers (público pode ver)
CREATE POLICY "Anyone can view organizers" 
ON public.organizers 
FOR SELECT 
USING (true);

-- Política simples para events (público pode ver)
CREATE POLICY "Anyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

-- ETAPA 2: Adicionar dados de teste
-- Newsletter subscribers teste
INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
VALUES
('teste1@example.com', 'João Silva', 'São Paulo', NOW() - INTERVAL '5 days', 'confirmed'),
('teste2@example.com', 'Maria Santos', 'Rio de Janeiro', NOW() - INTERVAL '3 days', 'confirmed'),
('teste3@example.com', 'Pedro Costa', 'Belo Horizonte', NOW() - INTERVAL '1 day', 'pending'),
('teste4@example.com', 'Ana Oliveira', 'Porto Alegre', NOW() - INTERVAL '2 days', 'confirmed')
ON CONFLICT (email) DO NOTHING;

-- Eventos de teste para calendar do usuário
INSERT INTO public.events (
  title, 
  start_date, 
  end_date, 
  city, 
  description,
  created_at
) VALUES
('Show de Rock Nacional', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'São Paulo', 'Evento teste para calendar', NOW()),
('Festival de Jazz', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', 'Rio de Janeiro', 'Festival teste', NOW()),
('Noite Eletrônica', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '5 hours', 'Curitiba', 'Festa eletrônica teste', NOW())
ON CONFLICT (title) DO NOTHING;