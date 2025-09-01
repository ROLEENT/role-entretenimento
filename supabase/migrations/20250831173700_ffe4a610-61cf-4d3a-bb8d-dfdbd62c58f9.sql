-- Desativar categorias antigas genéricas
UPDATE public.categories 
SET is_active = false 
WHERE kind IN ('revista', 'ambos') AND name IN ('Cultura', 'Arte', 'Música', 'Eventos', 'Lifestyle');

-- Criar as categorias específicas da revista ROLÊ
INSERT INTO public.categories (name, slug, kind, color, description, is_active) VALUES
('Editorial', 'editorial', 'revista', '#FF6B6B', 'Textos editoriais e posicionamentos da revista', true),
('Posfácio', 'posfacio', 'revista', '#4ECDC4', 'Reflexões finais sobre eventos e temas abordados', true),
('ROLÊ.bpm', 'role-bpm', 'revista', '#45B7D1', 'Conteúdo musical e análises de batidas', true),
('Fala, ROLÊ', 'fala-role', 'revista', '#96CEB4', 'Entrevistas e conversas exclusivas', true),
('Dicas do ROLÊ', 'dicas-do-role', 'revista', '#FECA57', 'Dicas e recomendações da equipe', true),
('Rolôu e Rendeu', 'rolou-e-rendeu', 'revista', '#FF9FF3', 'Cobertura de eventos que aconteceram', true),
('Vitrine 360', 'vitrine-360', 'revista', '#A8E6CF', 'Showcase de artistas e locais em 360°', true),
('Creators', 'creators', 'revista', '#FFD93D', 'Conteúdo sobre criadores de conteúdo', true),
('Achadinhos', 'achadinhos', 'revista', '#6C5CE7', 'Descobertas e novidades da cena', true);