-- ETAPA 1: Corrigir RLS crítico
-- Habilitar RLS em tabelas que ainda não têm
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para admins gerenciarem parceiros
CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Políticas básicas para admins gerenciarem venues
CREATE POLICY "Admins can manage venues" 
ON public.venues 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Políticas básicas para admins gerenciarem organizers
CREATE POLICY "Admins can manage organizers" 
ON public.organizers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Políticas para eventos (público pode ver, admins podem gerenciar)
CREATE POLICY "Anyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage events" 
ON public.events 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- ETAPA 2: Adicionar dados de teste
-- Newsletter subscribers teste
INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) VALUES
('teste1@example.com', 'João Silva', 'São Paulo', NOW() - INTERVAL '5 days', 'confirmed'),
('teste2@example.com', 'Maria Santos', 'Rio de Janeiro', NOW() - INTERVAL '3 days', 'confirmed'),
('teste3@example.com', 'Pedro Costa', 'Belo Horizonte', NOW() - INTERVAL '1 day', 'pending'),
('teste4@example.com', 'Ana Oliveira', 'Porto Alegre', NOW() - INTERVAL '2 days', 'confirmed');

-- Eventos de teste para calendario do usuário
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
('Noite Eletrônica', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '5 hours', 'Curitiba', 'Festa eletrônica teste', NOW());