-- Adicionar apenas dados de teste para newsletter

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

INSERT INTO public.newsletter_subscribers (email, name, city, subscribed_at, status) 
SELECT 'teste5@example.com', 'Carlos Mendes', 'Florianópolis', NOW() - INTERVAL '7 days', 'confirmed'
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_subscribers WHERE email = 'teste5@example.com');