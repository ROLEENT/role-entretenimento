-- Confirmar coluna ticket_status existe (já existe conforme schema)
-- Adicionar constraint para validar apenas os quatro valores permitidos

-- Remover constraint existente se houver
ALTER TABLE public.agenda_itens 
  DROP CONSTRAINT IF EXISTS agenda_ticket_status_chk;

-- Adicionar constraint para aceitar apenas os quatro valores válidos
ALTER TABLE public.agenda_itens 
  ADD CONSTRAINT agenda_ticket_status_chk 
    CHECK (ticket_status IS NULL OR ticket_status IN ('free','paid','sold_out','invite_only'));