-- FASE 1: LIMPEZA DOS DADOS (CRÍTICO)

-- 1. Identificar e remover eventos duplicados mantendo apenas o mais recente
WITH duplicate_events AS (
  SELECT 
    title,
    COUNT(*) as count,
    array_agg(id ORDER BY created_at DESC) as ids
  FROM public.events 
  WHERE title IS NOT NULL 
  GROUP BY title 
  HAVING COUNT(*) > 1
),
events_to_delete AS (
  SELECT unnest(ids[2:]) as id_to_delete
  FROM duplicate_events
)
DELETE FROM public.events 
WHERE id IN (SELECT id_to_delete FROM events_to_delete);

-- 2. Limpar slugs com timestamps automáticos (remover sufixos numéricos desnecessários)
UPDATE public.events 
SET slug = regexp_replace(slug, '-\d+$', '')
WHERE slug ~ '-\d+$' 
AND NOT EXISTS (
  SELECT 1 FROM public.events e2 
  WHERE e2.slug = regexp_replace(public.events.slug, '-\d+$', '') 
  AND e2.id != public.events.id
);

-- 3. Corrigir eventos com dados incompletos críticos
UPDATE public.events 
SET 
  status = 'draft'
WHERE (
  title IS NULL OR title = '' OR
  date_start IS NULL OR
  city IS NULL OR city = ''
) AND status = 'published';

-- 4. Garantir slugs únicos para eventos sem slug
UPDATE public.events 
SET slug = fn_slugify(title || '-' || id::text)
WHERE slug IS NULL OR slug = '';

-- 5. Limpar eventos de teste explícitos
DELETE FROM public.events 
WHERE title ILIKE '%teste%' 
   OR title ILIKE '%test%' 
   OR title ILIKE '%exemplo%'
   OR summary ILIKE '%teste%';