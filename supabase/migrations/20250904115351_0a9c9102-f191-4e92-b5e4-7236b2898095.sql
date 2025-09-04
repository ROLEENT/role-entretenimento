-- Adicionar colunas faltantes à tabela events para corrigir erro na função create_event_cascade
ALTER TABLE public.events 
ADD COLUMN location_name TEXT,
ADD COLUMN address TEXT,
ADD COLUMN country TEXT,
ADD COLUMN currency TEXT DEFAULT 'BRL',
ADD COLUMN ticket_url TEXT;