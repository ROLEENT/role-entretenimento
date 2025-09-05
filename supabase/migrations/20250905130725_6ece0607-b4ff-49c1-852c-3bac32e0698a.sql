-- Habilitar a extensão pgcrypto para gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verificar se existe uma função ensure_preview_token que pode estar causando o problema
-- e remover se necessário
DROP TRIGGER IF EXISTS ensure_preview_token_trigger ON agenda_itens;
DROP FUNCTION IF EXISTS ensure_preview_token();

-- Inserir dados de exemplo na tabela agenda_itens (versão simplificada)
INSERT INTO agenda_itens (
  title,
  city,
  starts_at,
  slug,
  status,
  highlight_type
) VALUES 
(
  'Festival de Música Eletrônica Porto Alegre',
  'Porto Alegre',
  '2025-09-15T20:00:00Z',
  'festival-musica-eletronica-porto-alegre',
  'published',
  'vitrine'
),
(
  'Show de Rock Nacional - São Paulo',
  'São Paulo',
  '2025-09-12T19:30:00Z',
  'show-rock-nacional-sao-paulo',
  'published',
  'curatorial'
),
(
  'Teatro Musical - Rio de Janeiro',
  'Rio de Janeiro',
  '2025-09-10T20:00:00Z',
  'teatro-musical-rio-janeiro',
  'published',
  'curatorial'
);