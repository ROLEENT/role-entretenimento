-- Criar enums para highlight_type e publication_status
DO $$ BEGIN
  CREATE TYPE public.highlight_type AS ENUM ('none', 'curatorial', 'vitrine');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.publication_status AS ENUM ('draft', 'review', 'scheduled', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Adicionar novas colunas em agenda_itens
ALTER TABLE public.agenda_itens
  ADD COLUMN IF NOT EXISTS organizer_ids uuid[] DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS supporters jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sponsors jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS performances jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visual_art jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS highlight_type public.highlight_type NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ticketing jsonb,
  ADD COLUMN IF NOT EXISTS links jsonb,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_image_url text,
  ADD COLUMN IF NOT EXISTS status public.publication_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Criar tabela de séries de eventos
CREATE TABLE IF NOT EXISTS public.event_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  cover_url text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS na tabela event_series
ALTER TABLE public.event_series ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para event_series
CREATE POLICY "Admins can manage event series" 
ON public.event_series 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
));

CREATE POLICY "Anyone can view event series" 
ON public.event_series 
FOR SELECT 
USING (true);

-- Criar tabela de itens de série
CREATE TABLE IF NOT EXISTS public.event_series_items (
  series_id uuid NOT NULL REFERENCES public.event_series(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  edition_number int,
  PRIMARY KEY (series_id, event_id),
  UNIQUE(series_id, edition_number)
);

-- Habilitar RLS na tabela event_series_items
ALTER TABLE public.event_series_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para event_series_items
CREATE POLICY "Admins can manage event series items" 
ON public.event_series_items 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
));

CREATE POLICY "Anyone can view event series items" 
ON public.event_series_items 
FOR SELECT 
USING (true);

-- Função para garantir coerência: vitrine sempre marca is_sponsored = true
CREATE OR REPLACE FUNCTION public.fn_enforce_vitrine()
RETURNS trigger AS $$
BEGIN
  IF NEW.highlight_type = 'vitrine' THEN
    NEW.is_sponsored := true;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trg_enforce_vitrine ON public.agenda_itens;
CREATE TRIGGER trg_enforce_vitrine
BEFORE INSERT OR UPDATE ON public.agenda_itens
FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_vitrine();