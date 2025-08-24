-- Insert test data for blogs and comments
INSERT INTO public.blog_posts (title, content_html, summary, author_name, author_id, city, slug, slug_data, status, published_at, featured, cover_image)
VALUES 
('A Noite que Porto Alegre Parou', '<p>Uma análise completa da cena musical de Porto Alegre em 2024...</p>', 'Resumo do artigo sobre a cena musical', 'Editor ROLÊ', '00000000-0000-0000-0000-000000000000', 'porto-alegre', 'a-noite-que-porto-alegre-parou', 'a-noite-que-porto-alegre-parou', 'published', now(), true, '/src/assets/porto-alegre-events.jpg'),
('Floripa Beats: O Som da Ilha', '<p>Descubra os eventos que movimentaram Florianópolis...</p>', 'Eventos em Florianópolis', 'Editor ROLÊ', '00000000-0000-0000-0000-000000000000', 'florianopolis', 'floripa-beats-o-som-da-ilha', 'floripa-beats-o-som-da-ilha', 'published', now(), false, '/src/assets/florianopolis-events.jpg')
ON CONFLICT (slug) DO NOTHING;

-- Insert test comments
INSERT INTO public.blog_comments (post_id, author_name, author_email, content, is_approved) 
SELECT 
  bp.id,
  'João Silva',
  'joao@email.com',
  'Excelente artigo! Realmente mostra a riqueza da cena musical de Porto Alegre.',
  false
FROM public.blog_posts bp 
WHERE bp.slug = 'a-noite-que-porto-alegre-parou'
LIMIT 1;

INSERT INTO public.blog_comments (post_id, author_name, author_email, content, is_approved) 
SELECT 
  bp.id,
  'Maria Santos',
  'maria@email.com',
  'Adorei as dicas de eventos! Vou conferir essas casas noturnas.',
  false
FROM public.blog_posts bp 
WHERE bp.slug = 'floripa-beats-o-som-da-ilha'
LIMIT 1;

INSERT INTO public.blog_comments (post_id, author_name, author_email, content, is_approved) 
SELECT 
  bp.id,
  'Pedro Costa',
  'pedro@email.com',
  'Conteúdo de qualidade! Parabéns pela cobertura da cena local.',
  false
FROM public.blog_posts bp 
WHERE bp.slug = 'a-noite-que-porto-alegre-parou'
LIMIT 1;