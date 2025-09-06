-- Adicionar coluna de critérios de curadoria na tabela events
ALTER TABLE public.events 
ADD COLUMN curatorial_criteria JSONB DEFAULT '{}'::jsonb;

-- Adicionar comentário para documentar a estrutura esperada
COMMENT ON COLUMN public.events.curatorial_criteria IS 'Critérios de curadoria do ROLÊ. Estrutura: { "cultural_relevance": { "checked": boolean, "note": "string" }, "lineup": { "checked": boolean, "note": "string" }, ... }';

-- Criar índice para melhor performance nas consultas JSONB
CREATE INDEX idx_events_curatorial_criteria ON public.events USING GIN (curatorial_criteria);

-- Atualizar função para calcular score baseado nos critérios na tabela events
CREATE OR REPLACE FUNCTION public.update_event_curation_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calcular score baseado nos critérios de curadoria
  IF NEW.curatorial_criteria IS NOT NULL THEN
    NEW.curation_score := public.calculate_curatorial_score(NEW.curatorial_criteria);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar automaticamente o score quando os critérios mudarem
DROP TRIGGER IF EXISTS trigger_update_curation_score ON public.events;
CREATE TRIGGER trigger_update_curation_score
  BEFORE INSERT OR UPDATE OF curatorial_criteria ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_curation_score();