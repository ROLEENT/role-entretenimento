-- Adicionar coluna de critérios de curadoria na tabela agenda_itens
ALTER TABLE public.agenda_itens 
ADD COLUMN curatorial_criteria JSONB DEFAULT '{}'::jsonb;

-- Adicionar comentário para documentar a estrutura esperada
COMMENT ON COLUMN public.agenda_itens.curatorial_criteria IS 'Critérios de curadoria do ROLÊ. Estrutura: { "cultural_relevance": { "checked": boolean, "note": "string" }, "lineup": { "checked": boolean, "note": "string" }, ... }';

-- Criar índice para melhor performance nas consultas JSONB
CREATE INDEX idx_agenda_itens_curatorial_criteria ON public.agenda_itens USING GIN (curatorial_criteria);

-- Função auxiliar para calcular score de curadoria baseado nos critérios
CREATE OR REPLACE FUNCTION public.calculate_curatorial_score(criteria JSONB)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    (CASE WHEN (criteria->'cultural_relevance'->>'checked')::boolean = true THEN 1 ELSE 0 END) +
    (CASE WHEN (criteria->'lineup'->>'checked')::boolean = true THEN 1 ELSE 0 END) +
    (CASE WHEN (criteria->'visual_identity'->>'checked')::boolean = true THEN 1 ELSE 0 END) +
    (CASE WHEN (criteria->'experience'->>'checked')::boolean = true THEN 1 ELSE 0 END) +
    (CASE WHEN (criteria->'city_connection'->>'checked')::boolean = true THEN 1 ELSE 0 END) +
    (CASE WHEN (criteria->'audience_coherence'->>'checked')::boolean = true THEN 1 ELSE 0 END) +
    (CASE WHEN (criteria->'engagement_potential'->>'checked')::boolean = true THEN 1 ELSE 0 END) +
    (CASE WHEN (criteria->'innovation'->>'checked')::boolean = true THEN 1 ELSE 0 END),
    0
  );
$$;