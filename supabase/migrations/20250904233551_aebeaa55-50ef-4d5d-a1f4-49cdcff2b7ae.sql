-- Atualizar função de recálculo do score de curadoria
CREATE OR REPLACE FUNCTION public.recalc_event_curation_score(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE status
      WHEN 'met' THEN 1.0
      WHEN 'partial' THEN 0.5
      ELSE 0.0
    END
  ), 0)
  INTO v_score
  FROM public.event_curation_criteria
  WHERE event_id = p_event_id;

  UPDATE public.events
  SET curation_score = ROUND(v_score)::INTEGER
  WHERE id = p_event_id;
END $$;

-- Criar trigger para recálculo automático
CREATE OR REPLACE FUNCTION public.trg_ecc_recalc()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_event UUID;
BEGIN
  v_event := COALESCE(NEW.event_id, OLD.event_id);
  PERFORM public.recalc_event_curation_score(v_event);
  RETURN COALESCE(NEW, OLD);
END $$;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trg_ecc_recalc_aiud ON public.event_curation_criteria;
CREATE TRIGGER trg_ecc_recalc_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.event_curation_criteria
FOR EACH ROW
EXECUTE FUNCTION public.trg_ecc_recalc();

-- RPC para upsert de critérios + notas
CREATE OR REPLACE FUNCTION public.upsert_event_criteria(
  p_event_id uuid,
  p_notes text,
  p_items jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r JSONB;
BEGIN
  -- Atualizar notas
  UPDATE public.events 
  SET curation_notes = p_notes 
  WHERE id = p_event_id;

  -- Upsert critérios
  FOR r IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.event_curation_criteria(event_id, key, status, is_primary)
    VALUES (
      p_event_id,
      (r->>'key')::criterion_key,
      (r->>'status')::criterion_status,
      COALESCE((r->>'is_primary')::BOOLEAN, false)
    )
    ON CONFLICT (event_id, key) DO UPDATE
    SET status = EXCLUDED.status,
        is_primary = EXCLUDED.is_primary;
  END LOOP;

  PERFORM public.recalc_event_curation_score(p_event_id);
END $$;

-- View para chips rápidos (compatível com frontend atual)
CREATE OR REPLACE VIEW public.event_curation_chips AS
SELECT
  e.id as event_id,
  array(
    SELECT key::text
    FROM public.event_curation_criteria c
    WHERE c.event_id = e.id 
      AND (c.is_primary = true AND c.status IN ('met', 'partial'))
    ORDER BY 
      CASE c.status WHEN 'met' THEN 0 WHEN 'partial' THEN 1 ELSE 2 END,
      c.key
    LIMIT 3
  ) || 
  CASE 
    WHEN array_length(array(
      SELECT key::text
      FROM public.event_curation_criteria c
      WHERE c.event_id = e.id 
        AND (c.is_primary = true AND c.status IN ('met', 'partial'))
    ), 1) < 3 THEN
      array(
        SELECT key::text
        FROM public.event_curation_criteria c
        WHERE c.event_id = e.id 
          AND c.is_primary = false 
          AND c.status = 'met'
        ORDER BY c.key
        LIMIT 3 - COALESCE(array_length(array(
          SELECT key::text
          FROM public.event_curation_criteria c2
          WHERE c2.event_id = e.id 
            AND (c2.is_primary = true AND c2.status IN ('met', 'partial'))
        ), 1), 0)
      )
    ELSE ARRAY[]::text[]
  END as chips,
  e.curation_score,
  e.curation_notes
FROM public.events e
WHERE e.highlight_type IN ('editorial', 'curatorial');