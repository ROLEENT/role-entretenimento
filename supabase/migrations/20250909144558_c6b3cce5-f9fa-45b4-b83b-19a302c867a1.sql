-- Garantir que a tabela agenda_itens tenha organizer_id como FK obrigatório
-- e adicionar constraint para validar que eventos publicados tenham organizador

-- Primeiro, criar a FK se não existir
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

-- Adicionar constraint para validar organizador em eventos publicados
DO $$
BEGIN
  -- Drop constraint se já existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'agenda_itens_published_must_have_organizer' 
    AND table_name = 'agenda_itens'
  ) THEN
    ALTER TABLE public.agenda_itens DROP CONSTRAINT agenda_itens_published_must_have_organizer;
  END IF;
  
  -- Criar nova constraint
  ALTER TABLE public.agenda_itens 
  ADD CONSTRAINT agenda_itens_published_must_have_organizer 
  CHECK (
    status != 'published' OR 
    (organizer_id IS NOT NULL OR 
     EXISTS (
       SELECT 1 FROM public.agenda_item_organizers 
       WHERE agenda_id = agenda_itens.id
     ))
  );
END $$;