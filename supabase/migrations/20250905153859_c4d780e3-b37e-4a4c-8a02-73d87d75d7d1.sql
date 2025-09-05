-- ADICIONAR SOFT DELETE PARA EVENTOS
-- ====================================================================

-- 1. Adicionar coluna deleted_at para soft delete
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS events_deleted_at_idx ON public.events(deleted_at);

-- 3. View para listar apenas eventos ativos (não deletados)
CREATE OR REPLACE VIEW public.events_active AS
SELECT * FROM public.events WHERE deleted_at IS NULL;

-- 4. Função para soft delete seguro
CREATE OR REPLACE FUNCTION public.soft_delete_event(p_event_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.events
  SET deleted_at = NOW(), status = 'draft'
  WHERE id = p_event_id AND deleted_at IS NULL;
$$;

-- 5. Conceder permissões para a função
GRANT EXECUTE ON FUNCTION public.soft_delete_event(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.soft_delete_event(UUID) TO authenticated;