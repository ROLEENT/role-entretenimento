-- 1) Primeiro, remover a tabela atual e recriá-la com a estrutura correta
DROP TABLE IF EXISTS public.highlights CASCADE;

-- 2) Criar enum para cidade
DROP TYPE IF EXISTS city CASCADE;
CREATE TYPE city AS ENUM ('porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro');

-- 3) Tabela principal com estrutura correta (sem coluna gerada problemática)
CREATE TABLE public.highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city city NOT NULL,
  event_title TEXT NOT NULL,
  venue TEXT NOT NULL,
  ticket_url TEXT,
  role_text VARCHAR(400) NOT NULL,
  selection_reasons TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  photo_credit TEXT,
  event_date DATE,
  sort_order INT DEFAULT 100,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_highlights_updated_at
BEFORE UPDATE ON public.highlights
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) Índices úteis
CREATE INDEX idx_highlights_city_date ON public.highlights(city, event_date DESC);
CREATE INDEX idx_highlights_published ON public.highlights(is_published, event_date DESC);
CREATE UNIQUE INDEX uq_highlights_city_event
  ON public.highlights(lower(event_title), city, event_date);

-- 6) RLS
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- 6.1) Leitura pública apenas de itens publicados
CREATE POLICY "Public can read published highlights"
ON public.highlights FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- 6.2) Edição só para admins aprovados
CREATE POLICY "Admins can insert"
ON public.highlights FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.approved_admins aa
    WHERE aa.email = auth.email() AND aa.is_active = true
  )
);

CREATE POLICY "Admins can update"
ON public.highlights FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.approved_admins aa
    WHERE aa.email = auth.email() AND aa.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.approved_admins aa
    WHERE aa.email = auth.email() AND aa.is_active = true
  )
);

CREATE POLICY "Admins can delete"
ON public.highlights FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.approved_admins aa
    WHERE aa.email = auth.email() AND aa.is_active = true
  )
);

-- 7) Atualizar políticas de Storage para bucket highlights
DROP POLICY IF EXISTS "Anyone can view highlights images" ON storage.objects;
DROP POLICY IF EXISTS "Approved admins can upload highlights images" ON storage.objects;
DROP POLICY IF EXISTS "Approved admins can update highlights images" ON storage.objects;
DROP POLICY IF EXISTS "Approved admins can delete highlights images" ON storage.objects;

CREATE POLICY "Anyone can view highlights images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'highlights');

CREATE POLICY "Approved admins can upload highlights images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.approved_admins aa
    WHERE aa.email = auth.email() AND aa.is_active = true
  )
);

CREATE POLICY "Approved admins can update highlights images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.approved_admins aa
    WHERE aa.email = auth.email() AND aa.is_active = true
  )
);

CREATE POLICY "Approved admins can delete highlights images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.approved_admins aa
    WHERE aa.email = auth.email() AND aa.is_active = true
  )
);

-- 8) Inserir exemplo de dados
INSERT INTO public.highlights
(city, event_title, venue, ticket_url, role_text, selection_reasons, image_url, photo_credit, event_date, is_published, sort_order)
VALUES
('rio_de_janeiro',
 'Fiesta Latina Baila Baila',
 'Club Substation, Copacabana',
 'https://shotgun.link/exemplo',
 'O Substation vira pista latina. Reggaeton, funk e pop latino tomam conta da madrugada em Copacabana. Mistura quente para quem busca perreo e calor carioca.',
 ARRAY['diversidade','desejo de pista','impacto cultural'],
 'baila-baila-2108.jpg',
 'Foto: Divulgação',
 '2025-08-21',
 true,
 10
);