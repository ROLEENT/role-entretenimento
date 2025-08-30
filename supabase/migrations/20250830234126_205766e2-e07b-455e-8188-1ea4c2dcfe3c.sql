-- Corrigir schema da tabela organizers
ALTER TABLE public.organizers 
ADD COLUMN IF NOT EXISTS contact_whatsapp text,
ADD COLUMN IF NOT EXISTS bio_short text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS type text DEFAULT 'organizador',
ADD COLUMN IF NOT EXISTS booking_email text,
ADD COLUMN IF NOT EXISTS booking_whatsapp text;

-- Verificar e corrigir tabela venues se necessário
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS contacts_json jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS state text DEFAULT 'SP';

-- Garantir que artists tem todas as colunas necessárias
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS city_id integer REFERENCES cities(id);

-- Verificar indices para performance
CREATE INDEX IF NOT EXISTS idx_artists_city_id ON public.artists(city_id);
CREATE INDEX IF NOT EXISTS idx_venues_city_id ON public.venues(city_id);
CREATE INDEX IF NOT EXISTS idx_organizers_city_id ON public.organizers(city_id);