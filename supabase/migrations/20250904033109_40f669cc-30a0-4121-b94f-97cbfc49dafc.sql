-- Adicionar coluna subtitle à tabela events para corrigir erro na função create_event_cascade
ALTER TABLE public.events 
ADD COLUMN subtitle TEXT;