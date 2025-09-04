-- Corrigir view de chips com lógica mais simples
DROP VIEW IF EXISTS public.event_curation_chips;
CREATE OR REPLACE VIEW public.event_curation_chips AS
WITH primary_chips AS (
  SELECT 
    event_id,
    array_agg(key::text ORDER BY 
      CASE status WHEN 'met' THEN 0 WHEN 'partial' THEN 1 ELSE 2 END,
      key
    ) as chips
  FROM public.event_curation_criteria 
  WHERE is_primary = true AND status IN ('met', 'partial')
  GROUP BY event_id
),
fallback_chips AS (
  SELECT 
    event_id,
    array_agg(key::text ORDER BY key) as chips
  FROM public.event_curation_criteria 
  WHERE is_primary = false AND status = 'met'
  GROUP BY event_id
)
SELECT
  e.id as event_id,
  CASE 
    WHEN array_length(pc.chips, 1) >= 3 THEN pc.chips[1:3]
    WHEN pc.chips IS NULL THEN COALESCE(fc.chips[1:3], ARRAY[]::text[])
    ELSE pc.chips || COALESCE(fc.chips[1:(3-array_length(pc.chips, 1))], ARRAY[]::text[])
  END as chips,
  e.curation_score,
  e.curation_notes
FROM public.events e
LEFT JOIN primary_chips pc ON pc.event_id = e.id
LEFT JOIN fallback_chips fc ON fc.event_id = e.id
WHERE e.highlight_type IN ('editorial', 'curatorial');