-- Apenas adicionar dados de teste se não existirem

-- Newsletter subscribers teste
INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
VALUES
('teste1@example.com', 'João Silva', 'São Paulo', NOW() - INTERVAL '5 days', 'confirmed'),
('teste2@example.com', 'Maria Santos', 'Rio de Janeiro', NOW() - INTERVAL '3 days', 'confirmed'),
('teste3@example.com', 'Pedro Costa', 'Belo Horizonte', NOW() - INTERVAL '1 day', 'pending'),
('teste4@example.com', 'Ana Oliveira', 'Porto Alegre', NOW() - INTERVAL '2 days', 'confirmed')
ON CONFLICT (email) DO NOTHING;

-- Verificar se existe tabela events e adicionar eventos teste
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
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
    ON CONFLICT DO NOTHING;
  ELSE
    -- Se não existe tabela events, inserir em agenda_itens
    INSERT INTO public.agenda_itens (
      title, 
      start_at, 
      end_at, 
      city, 
      summary,
      status,
      created_at
    ) VALUES
    ('Show de Rock Nacional', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'São Paulo', 'Evento teste para calendar', 'published', NOW()),
    ('Festival de Jazz', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', 'Rio de Janeiro', 'Festival teste', 'published', NOW()),
    ('Noite Eletrônica', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '5 hours', 'Curitiba', 'Festa eletrônica teste', 'published', NOW())
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;