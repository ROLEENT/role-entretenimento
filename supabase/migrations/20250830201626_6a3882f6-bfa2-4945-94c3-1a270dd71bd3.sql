-- Adicionar dados de teste básicos

-- Newsletter subscribers teste (verificar se já existem)
INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
SELECT 'teste1@example.com', 'João Silva', 'São Paulo', NOW() - INTERVAL '5 days', 'confirmed'
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_subscribers WHERE email = 'teste1@example.com');

INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
SELECT 'teste2@example.com', 'Maria Santos', 'Rio de Janeiro', NOW() - INTERVAL '3 days', 'confirmed'
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_subscribers WHERE email = 'teste2@example.com');

INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
SELECT 'teste3@example.com', 'Pedro Costa', 'Belo Horizonte', NOW() - INTERVAL '1 day', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_subscribers WHERE email = 'teste3@example.com');

INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
SELECT 'teste4@example.com', 'Ana Oliveira', 'Porto Alegre', NOW() - INTERVAL '2 days', 'confirmed'
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_subscribers WHERE email = 'teste4@example.com');

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
) 
SELECT 'Show de Rock Nacional', 'show-rock-nacional-teste', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'São Paulo', 'Evento teste para calendar', 'published', 'curadoria', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.agenda_itens WHERE slug = 'show-rock-nacional-teste');

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
) 
SELECT 'Festival de Jazz', 'festival-jazz-teste', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', 'Rio de Janeiro', 'Festival teste', 'published', 'curadoria', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.agenda_itens WHERE slug = 'festival-jazz-teste');

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
) 
SELECT 'Noite Eletrônica', 'noite-eletronica-teste', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '5 hours', 'Curitiba', 'Festa eletrônica teste', 'published', 'curadoria', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.agenda_itens WHERE slug = 'noite-eletronica-teste');