-- Inserir dados com mais campos obrigatórios
INSERT INTO agenda_itens (
  title,
  city,
  starts_at,
  slug,
  status,
  highlight_type,
  visibility_type,
  summary,
  subtitle
) VALUES 
(
  'Festival de Música Eletrônica Porto Alegre',
  'Porto Alegre',
  '2025-09-15T20:00:00Z',
  'festival-musica-eletronica-porto-alegre',
  'published',
  'vitrine',
  'vitrine',
  'O maior festival de música eletrônica do sul do Brasil.',
  'Uma noite inesquecível com os melhores DJs'
),
(
  'Show de Rock Nacional - São Paulo',
  'São Paulo',
  '2025-09-12T19:30:00Z',
  'show-rock-nacional-sao-paulo',
  'published',
  'curatorial',
  'curadoria',
  'Uma noite especial com o melhor do rock nacional.',
  'Bandas locais se apresentam no centro da cidade'
),
(
  'Teatro Musical - Rio de Janeiro',
  'Rio de Janeiro',
  '2025-09-10T20:00:00Z',
  'teatro-musical-rio-janeiro',
  'published',
  'curatorial',
  'curadoria',
  'Um espetáculo que celebra a música popular brasileira.',
  'Espetáculo baseado em clássicos da MPB'
);