-- Garantir que a tabela agenda_itens tenha organizer_id como FK
DO $$
BEGIN
  -- Verificar se a FK já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'agenda_itens_organizer_id_fkey' 
    AND table_name = 'agenda_itens'
  ) THEN
    -- Adicionar FK para organizers
    ALTER TABLE public.agenda_itens 
    ADD CONSTRAINT agenda_itens_organizer_id_fkey 
    FOREIGN KEY (organizer_id) REFERENCES public.organizers(id);
  END IF;
END $$;

-- Criar função de validação para organizador obrigatório
CREATE OR REPLACE FUNCTION public.validate_event_organizer()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o evento está sendo publicado, deve ter pelo menos um organizador
  IF NEW.status = 'published' THEN
    IF NEW.organizer_id IS NULL AND NOT EXISTS (
      SELECT 1 FROM public.agenda_item_organizers 
      WHERE agenda_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Eventos publicados devem ter pelo menos um organizador definido';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar organizador antes de salvar
DROP TRIGGER IF EXISTS agenda_itens_validate_organizer_trigger ON public.agenda_itens;
CREATE TRIGGER agenda_itens_validate_organizer_trigger
  BEFORE INSERT OR UPDATE ON public.agenda_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_organizer();