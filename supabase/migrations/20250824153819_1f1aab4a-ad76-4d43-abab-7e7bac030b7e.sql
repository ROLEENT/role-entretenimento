-- Insert simple test data for comments without blog posts dependency
INSERT INTO public.blog_comments (post_id, author_name, author_email, content, is_approved) 
VALUES 
('00000000-0000-0000-0000-000000000001', 'João Silva', 'joao@email.com', 'Excelente artigo! Realmente mostra a riqueza da cena musical de Porto Alegre.', false),
('00000000-0000-0000-0000-000000000001', 'Maria Santos', 'maria@email.com', 'Adorei as dicas de eventos! Vou conferir essas casas noturnas.', false),
('00000000-0000-0000-0000-000000000002', 'Pedro Costa', 'pedro@email.com', 'Conteúdo de qualidade! Parabéns pela cobertura da cena local.', false);

-- Insert test contact message
INSERT INTO public.contact_messages (name, email, subject, message) 
VALUES 
('Carlos Teste', 'carlos@teste.com', 'Dúvida sobre eventos', 'Olá, gostaria de saber como posso cadastrar meu evento na plataforma.'),
('Ana Silva', 'ana@teste.com', 'Parceria', 'Tenho uma casa noturna e gostaria de fazer parceria com vocês.');