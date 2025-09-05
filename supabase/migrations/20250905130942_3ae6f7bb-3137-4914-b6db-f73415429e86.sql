-- Criar nova função ensure_preview_token que usa gen_random_uuid
CREATE OR REPLACE FUNCTION ensure_preview_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preview_token IS NULL OR NEW.preview_token = '' THEN
    NEW.preview_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
CREATE TRIGGER trg_agenda_preview_token
  BEFORE INSERT OR UPDATE ON agenda_itens
  FOR EACH ROW EXECUTE FUNCTION ensure_preview_token();

-- Agora inserir os dados
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