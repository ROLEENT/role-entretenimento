-- Add artists_names column to agenda_itens table
ALTER TABLE public.agenda_itens
  ADD COLUMN IF NOT EXISTS artists_names text[] DEFAULT '{}';

-- Create GIN index for efficient array searches on artists_names
CREATE INDEX IF NOT EXISTS agenda_itens_artists_names_idx
  ON public.agenda_itens USING gin (artists_names);