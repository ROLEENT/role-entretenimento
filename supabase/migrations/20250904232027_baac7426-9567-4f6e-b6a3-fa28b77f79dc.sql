-- Criar novos enums para critérios de curadoria
CREATE TYPE IF NOT EXISTS criterion_key AS ENUM (
  'relevancia','qualidade','diversidade','impacto',
  'coerencia','experiencia','tecnica','acessibilidade'
);

CREATE TYPE IF NOT EXISTS criterion_status AS ENUM ('met','partial','na');

-- Adicionar novos campos à tabela events
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS curation_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS curation_notes TEXT;

-- Criar tabela de critérios por evento
CREATE TABLE IF NOT EXISTS public.event_curation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  key criterion_key NOT NULL,
  status criterion_status NOT NULL DEFAULT 'na'::criterion_status,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, key)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ecc_event ON public.event_curation_criteria(event_id);
CREATE INDEX IF NOT EXISTS idx_ecc_key ON public.event_curation_criteria(key);

-- Função para recalcular score de curadoria
CREATE OR REPLACE FUNCTION public.recalc_event_curation_score(p_event_id UUID)
RETURNS VOID
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

-- Trigger para recalcular automático
CREATE OR REPLACE FUNCTION public.trg_ecc_recalc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_event UUID;
BEGIN
  v_event := COALESCE(NEW.event_id, OLD.event_id);
  PERFORM public.recalc_event_curation_score(v_event);
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_ecc_recalc_aiud ON public.event_curation_criteria;
CREATE TRIGGER trg_ecc_recalc_aiud
  AFTER INSERT OR UPDATE OR DELETE ON public.event_curation_criteria
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_ecc_recalc();

-- RPC para upsert de critérios
CREATE OR REPLACE FUNCTION public.upsert_event_criteria(
  p_event_id UUID,
  p_notes TEXT,
  p_items JSONB
)
RETURNS VOID
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

-- View para chips rápidos
CREATE OR REPLACE VIEW public.event_curation_chips AS
SELECT
  e.id as event_id,
  ARRAY(
    SELECT key::TEXT
    FROM public.event_curation_criteria c
    WHERE c.event_id = e.id
      AND c.status IN ('met', 'partial')
    ORDER BY 
      CASE WHEN is_primary THEN 0 ELSE 1 END,
      CASE status WHEN 'met' THEN 0 WHEN 'partial' THEN 1 ELSE 2 END,
      key
    LIMIT 3
  ) as chips,
  e.curation_score,
  e.curation_notes
FROM public.events e;

-- RLS policies
ALTER TABLE public.event_curation_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view curation criteria" ON public.event_curation_criteria
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage curation criteria" ON public.event_curation_criteria
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );