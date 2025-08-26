-- Inserir dados de exemplo para analytics_events
-- Isso é apenas para demonstração, em produção os dados virão do tracking real

-- Inserir eventos de pageview
INSERT INTO public.analytics_events (event_name, city, source, page_url, session_id, created_at) VALUES
('pageview', 'São Paulo', 'web', '/', 'session_1', NOW() - INTERVAL '30 days'),
('pageview', 'Rio de Janeiro', 'web', '/eventos', 'session_2', NOW() - INTERVAL '29 days'),
('pageview', 'Belo Horizonte', 'mobile', '/destaques', 'session_3', NOW() - INTERVAL '28 days'),
('pageview', 'São Paulo', 'web', '/', 'session_4', NOW() - INTERVAL '27 days'),
('pageview', 'Salvador', 'social', '/eventos', 'session_5', NOW() - INTERVAL '26 days'),
('pageview', 'Porto Alegre', 'web', '/destaques', 'session_6', NOW() - INTERVAL '25 days'),
('pageview', 'Curitiba', 'direct', '/', 'session_7', NOW() - INTERVAL '24 days'),
('pageview', 'Brasília', 'google', '/eventos', 'session_8', NOW() - INTERVAL '23 days'),
('pageview', 'Fortaleza', 'web', '/sobre', 'session_9', NOW() - INTERVAL '22 days'),
('pageview', 'Recife', 'web', '/contato', 'session_10', NOW() - INTERVAL '21 days');

-- Inserir eventos de click
INSERT INTO public.analytics_events (event_name, city, source, page_url, event_data, session_id, created_at) VALUES
('click', 'São Paulo', 'web', '/', '{"element": "hero_cta"}', 'session_1', NOW() - INTERVAL '30 days'),
('click', 'Rio de Janeiro', 'web', '/eventos', '{"element": "event_card"}', 'session_2', NOW() - INTERVAL '29 days'),
('click', 'Belo Horizonte', 'mobile', '/destaques', '{"element": "highlight_button"}', 'session_3', NOW() - INTERVAL '28 days'),
('click', 'São Paulo', 'web', '/', '{"element": "menu_eventos"}', 'session_4', NOW() - INTERVAL '27 days'),
('click', 'Salvador', 'social', '/eventos', '{"element": "filter_city"}', 'session_5', NOW() - INTERVAL '26 days'),
('click', 'Porto Alegre', 'web', '/destaques', '{"element": "share_button"}', 'session_6', NOW() - INTERVAL '25 days'),
('click', 'Curitiba', 'direct', '/', '{"element": "search_button"}', 'session_7', NOW() - INTERVAL '24 days'),
('click', 'Brasília', 'google', '/eventos', '{"element": "venue_link"}', 'session_8', NOW() - INTERVAL '23 days'),
('click', 'Fortaleza', 'web', '/sobre', '{"element": "contact_button"}', 'session_9', NOW() - INTERVAL '22 days'),
('click', 'Recife', 'web', '/contato', '{"element": "submit_form"}', 'session_10', NOW() - INTERVAL '21 days');

-- Inserir eventos de conversão
INSERT INTO public.analytics_events (event_name, city, source, page_url, event_data, session_id, created_at) VALUES
('cta_click', 'São Paulo', 'web', '/', '{"cta_name": "criar_evento", "target_url": "/criar-evento"}', 'session_1', NOW() - INTERVAL '30 days'),
('cta_click', 'Rio de Janeiro', 'web', '/eventos', '{"cta_name": "comprar_ingresso", "target_url": "/evento/123"}', 'session_2', NOW() - INTERVAL '29 days'),
('conversion', 'Belo Horizonte', 'mobile', '/auth', '{"conversion_type": "signup", "value": 1}', 'session_3', NOW() - INTERVAL '28 days'),
('form_submit', 'São Paulo', 'web', '/contato', '{"form_name": "contact_form"}', 'session_4', NOW() - INTERVAL '27 days'),
('cta_click', 'Salvador', 'social', '/eventos', '{"cta_name": "ver_mais", "target_url": "/eventos/salvador"}', 'session_5', NOW() - INTERVAL '26 days'),
('conversion', 'Porto Alegre', 'web', '/auth', '{"conversion_type": "login", "value": 1}', 'session_6', NOW() - INTERVAL '25 days'),
('cta_click', 'Curitiba', 'direct', '/', '{"cta_name": "newsletter", "target_url": "#newsletter"}', 'session_7', NOW() - INTERVAL '24 days'),
('form_submit', 'Brasília', 'google', '/criar-evento', '{"form_name": "event_form"}', 'session_8', NOW() - INTERVAL '23 days'),
('conversion', 'Fortaleza', 'web', '/eventos', '{"conversion_type": "event_view", "value": 1}', 'session_9', NOW() - INTERVAL '22 days'),
('cta_click', 'Recife', 'web', '/contato', '{"cta_name": "whatsapp", "target_url": "https://wa.me/123"}', 'session_10', NOW() - INTERVAL '21 days');

-- Inserir mais dados para os últimos 15 dias para simular atividade recente
INSERT INTO public.analytics_events (event_name, city, source, page_url, session_id, created_at) 
SELECT 
  CASE WHEN random() < 0.6 THEN 'pageview'
       WHEN random() < 0.8 THEN 'click' 
       ELSE 'cta_click' END,
  CASE WHEN random() < 0.3 THEN 'São Paulo'
       WHEN random() < 0.5 THEN 'Rio de Janeiro'
       WHEN random() < 0.65 THEN 'Belo Horizonte'
       WHEN random() < 0.75 THEN 'Salvador'
       WHEN random() < 0.85 THEN 'Porto Alegre'
       ELSE 'Curitiba' END,
  CASE WHEN random() < 0.7 THEN 'web'
       WHEN random() < 0.85 THEN 'mobile'
       WHEN random() < 0.92 THEN 'google'
       ELSE 'social' END,
  CASE WHEN random() < 0.4 THEN '/'
       WHEN random() < 0.7 THEN '/eventos'
       WHEN random() < 0.85 THEN '/destaques'
       ELSE '/sobre' END,
  'session_' || generate_random_uuid(),
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 500);

-- Atualizar user_id para alguns eventos (simular usuários logados)
UPDATE public.analytics_events 
SET user_id = (
  SELECT id FROM auth.users 
  ORDER BY random() 
  LIMIT 1
)
WHERE random() < 0.3;

-- Refresh da view analytics_summary
REFRESH MATERIALIZED VIEW IF EXISTS public.analytics_summary;