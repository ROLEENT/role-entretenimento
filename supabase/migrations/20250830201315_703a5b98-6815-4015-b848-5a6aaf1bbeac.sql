-- ETAPA 1: Corrigir RLS crítico
-- Habilitar RLS apenas nas tabelas que ainda não têm
DO $$
BEGIN
  -- Verificar e habilitar RLS onde necessário
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'partners' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'venues' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'organizers' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'events' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Políticas para venues (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'venues' 
    AND policyname = 'Admins can manage venues'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage venues" 
    ON public.venues 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'') 
        AND is_active = true
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'') 
        AND is_active = true
      )
    )';
  END IF;
END $$;

-- Políticas para organizers (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'organizers' 
    AND policyname = 'Admins can manage organizers'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage organizers" 
    ON public.organizers 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'') 
        AND is_active = true
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'') 
        AND is_active = true
      )
    )';
  END IF;
END $$;

-- Políticas para events (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'events' 
    AND policyname = 'Anyone can view events'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view events" 
    ON public.events 
    FOR SELECT 
    USING (true)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'events' 
    AND policyname = 'Admins can manage events'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage events" 
    ON public.events 
    FOR INSERT, UPDATE, DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'') 
        AND is_active = true
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'') 
        AND is_active = true
      )
    )';
  END IF;
END $$;

-- ETAPA 2: Adicionar dados de teste (apenas se não existirem)
-- Newsletter subscribers teste
INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
SELECT * FROM (VALUES
  ('teste1@example.com', 'João Silva', 'São Paulo', NOW() - INTERVAL '5 days', 'confirmed'),
  ('teste2@example.com', 'Maria Santos', 'Rio de Janeiro', NOW() - INTERVAL '3 days', 'confirmed'),
  ('teste3@example.com', 'Pedro Costa', 'Belo Horizonte', NOW() - INTERVAL '1 day', 'pending'),
  ('teste4@example.com', 'Ana Oliveira', 'Porto Alegre', NOW() - INTERVAL '2 days', 'confirmed')
) AS t(email, name, city, subscribed_at, status)
WHERE NOT EXISTS (
  SELECT 1 FROM public.newsletter_subscribers WHERE email = t.email
);

-- Eventos de teste para calendar do usuário
INSERT INTO public.events (
  title, 
  start_date, 
  end_date, 
  city, 
  description,
  created_at
) 
SELECT * FROM (VALUES
  ('Show de Rock Nacional', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'São Paulo', 'Evento teste para calendar', NOW()),
  ('Festival de Jazz', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', 'Rio de Janeiro', 'Festival teste', NOW()),
  ('Noite Eletrônica', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '5 hours', 'Curitiba', 'Festa eletrônica teste', NOW())
) AS t(title, start_date, end_date, city, description, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.events WHERE title = t.title
);