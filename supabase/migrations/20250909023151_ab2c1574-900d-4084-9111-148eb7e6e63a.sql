-- Correção do nome do artista Resp para Resp3x
UPDATE public.artists 
SET 
  stage_name = 'Resp3x',
  slug = 'resp3x',
  updated_at = NOW()
WHERE id = '090debc5-c228-4610-8185-4c0887a73853';