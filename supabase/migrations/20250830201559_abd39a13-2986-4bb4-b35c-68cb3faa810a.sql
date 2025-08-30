-- Adicionar apenas dados de teste que funcionam

-- Newsletter subscribers teste
INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
VALUES
('teste1@example.com', 'João Silva', 'São Paulo', NOW() - INTERVAL '5 days', 'confirmed'),
('teste2@example.com', 'Maria Santos', 'Rio de Janeiro', NOW() - INTERVAL '3 days', 'confirmed'),
('teste3@example.com', 'Pedro Costa', 'Belo Horizonte', NOW() - INTERVAL '1 day', 'pending'),
('teste4@example.com', 'Ana Oliveira', 'Porto Alegre', NOW() - INTERVAL '2 days', 'confirmed')
ON CONFLICT (email) DO NOTHING;

-- Agenda itens teste para o calendário do usuário
INSERT INTO public.agenda_itens (
  title, 
  slug,
  start_at, 
  end_at, 
  city, 
  summary,
  status,
  visibility_type,
  created_at
) VALUES
('Show de Rock Nacional', 'show-rock-nacional-teste', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'São Paulo', 'Evento teste para calendar', 'published', 'curadoria', NOW()),
('Festival de Jazz', 'festival-jazz-teste', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', 'Rio de Janeiro', 'Festival teste', 'published', 'curadoria', NOW()),
('Noite Eletrônica', 'noite-eletronica-teste', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '5 hours', 'Curitiba', 'Festa eletrônica teste', 'published', 'curadoria', NOW())
ON CONFLICT (slug) DO NOTHING;