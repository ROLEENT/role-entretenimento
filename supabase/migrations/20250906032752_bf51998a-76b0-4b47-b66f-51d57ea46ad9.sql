-- Alterar status dos eventos de teste/fake para draft
-- Isso os removerá da agenda pública mas manterá os dados para referência

UPDATE public.events 
SET status = 'draft'
WHERE id IN (
  '123e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174001', 
  '123e4567-e89b-12d3-a456-426614174002',
  '123e4567-e89b-12d3-a456-426614174003',
  '123e4567-e89b-12d3-a456-426614174004',
  '123e4567-e89b-12d3-a456-426614174005',
  '123e4567-e89b-12d3-a456-426614174006',
  '123e4567-e89b-12d3-a456-426614174007',
  '123e4567-e89b-12d3-a456-426614174008',
  '123e4567-e89b-12d3-a456-426614174009',
  '123e4567-e89b-12d3-a456-426614174010'
)
AND status = 'published'
AND (
  title ILIKE '%Festival de Música Eletrônica%' OR
  title ILIKE '%Show de Rock Alternativo%' OR
  title ILIKE '%Noite de Jazz%' OR
  title ILIKE '%Festival de Hip Hop%' OR
  title ILIKE '%Concerto de Música Clássica%' OR
  title ILIKE '%Festival de Reggae%' OR
  title ILIKE '%Show de Música Pop%' OR
  title ILIKE '%Festa de Música Funk%' OR
  title ILIKE '%Festival de Música Sertaneja%' OR
  title ILIKE '%Show de MPB%' OR
  title ILIKE '%Festival de Música Indie%'
);