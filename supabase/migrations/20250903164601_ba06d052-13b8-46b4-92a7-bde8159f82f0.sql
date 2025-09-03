-- ===== ENUMS =====
DO $$ BEGIN CREATE TYPE public.highlight_type AS ENUM ('none','editorial','vitrine'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.publication_status AS ENUM ('draft','review','scheduled','published','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.age_rating AS ENUM ('L','10','12','14','16','18'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.partner_role  AS ENUM ('organizer','supporter','sponsor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== SÉRIES =====
CREATE TABLE IF NOT EXISTS public.event_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name citext NOT NULL UNIQUE,
  slug citext NOT NULL UNIQUE,
  description text,
  cover_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_series_items (
  series_id uuid NOT NULL REFERENCES public.event_series(id) ON DELETE CASCADE,
  event_id  uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  edition_number int,
  PRIMARY KEY (series_id, event_id),
  UNIQUE(series_id, edition_number)
);

-- ===== ATUALIZAÇÕES NA TABELA AGENDA_ITENS =====
-- Adicionar novas colunas se não existirem
ALTER TABLE public.agenda_itens 
ADD COLUMN IF NOT EXISTS doors_open_utc timestamptz,
ADD COLUMN IF NOT EXISTS headliner_starts_utc timestamptz,
ADD COLUMN IF NOT EXISTS ticket_rules jsonb,
ADD COLUMN IF NOT EXISTS age_notes text,
ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.event_series(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS edition_number int;

-- ===== PARCEIROS (organizadores, apoiadores, patrocinadores) =====
CREATE TABLE IF NOT EXISTS public.event_partners (
  event_id   uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  agent_id   uuid REFERENCES public.organizers(id) ON DELETE SET NULL,
  name       text,
  role       public.partner_role NOT NULL,
  tier       text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY(event_id, role, agent_id, name)
);

-- ===== LINEUP com B2B =====
CREATE TABLE IF NOT EXISTS public.event_lineup_slots (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  stage     text,
  starts_at timestamptz,
  ends_at   timestamptz,
  notes     text,
  position  int NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lineup_slots_event ON public.event_lineup_slots(event_id, position);

CREATE TABLE IF NOT EXISTS public.event_lineup_slot_artists (
  slot_id     uuid NOT NULL REFERENCES public.event_lineup_slots(id) ON DELETE CASCADE,
  artist_id   uuid REFERENCES public.artists(id) ON DELETE SET NULL,
  display_name text,
  ord         int NOT NULL,
  PRIMARY KEY(slot_id, ord)
);

-- ===== PERFORMANCES NÃO MUSICAIS =====
CREATE TABLE IF NOT EXISTS public.event_performances (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  name      text NOT NULL,
  kind      text NOT NULL,
  starts_at timestamptz,
  stage     text,
  notes     text
);

-- ===== ARTISTAS VISUAIS =====
CREATE TABLE IF NOT EXISTS public.event_visual_artists (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  uuid NOT NULL REFERENCES public.agenda_itens(id) ON DELETE CASCADE,
  name      text NOT NULL,
  work      text,
  portfolio_url text
);

-- ===== FUNÇÕES AUXILIARES / TRIGGERS =====
CREATE OR REPLACE FUNCTION public.fn_slugify(txt text)
RETURNS citext AS $$
DECLARE s text; BEGIN
  s := lower(regexp_replace(regexp_replace(txt, '\s+', '-', 'g'), '[^a-z0-9\-]', '', 'g'));
  RETURN s::citext; END; $$ LANGUAGE plpgsql IMMUTABLE;

-- ===== RLS =====
ALTER TABLE public.event_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_lineup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_lineup_slot_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_visual_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_series_items ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir INSERT anônimo como rascunho; leitura pública só de publicados
CREATE POLICY event_partners_public ON public.event_partners FOR SELECT TO anon USING (true);
CREATE POLICY event_lineup_slots_public ON public.event_lineup_slots FOR SELECT TO anon USING (true);
CREATE POLICY event_lineup_slot_artists_public ON public.event_lineup_slot_artists FOR SELECT TO anon USING (true);
CREATE POLICY event_performances_public ON public.event_performances FOR SELECT TO anon USING (true);
CREATE POLICY event_visual_artists_public ON public.event_visual_artists FOR SELECT TO anon USING (true);
CREATE POLICY event_series_public ON public.event_series FOR SELECT TO anon USING (true);
CREATE POLICY event_series_items_public ON public.event_series_items FOR SELECT TO anon USING (true);

-- ===== RPC transacional =====
CREATE OR REPLACE FUNCTION public.create_event_cascade(p jsonb)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v_event_id uuid; v_series_id uuid; v_slot_id uuid; i int; BEGIN
  -- 1) evento
  INSERT INTO public.agenda_itens (
    title, slug, city, venue_id, address,
    cover_url, alt_text, starts_at, end_at, doors_open_utc, headliner_starts_utc,
    summary, description, price_min, price_max, age_rating, age_notes,
    highlight_type, is_sponsored, ticketing, ticket_rules, links, accessibility, gallery_urls,
    tags, genres, status, publish_at, seo_title, seo_description, og_image_url,
    series_id, edition_number, created_by
  ) VALUES (
    p->>'title', COALESCE(NULLIF(p->>'slug',''), public.fn_slugify(p->>'title')),
    p->>'city', (p->>'venue_id')::uuid, NULLIF(p->>'address',''),
    p->>'cover_url', p->>'cover_alt', (p->>'start_utc')::timestamptz, (p->>'end_utc')::timestamptz,
    NULLIF(p->>'doors_open_utc','')::timestamptz, NULLIF(p->>'headliner_starts_utc','')::timestamptz,
    NULLIF(p->>'summary',''), p->>'description', (p->>'min_price')::numeric, (p->>'max_price')::numeric,
    COALESCE(p->>'age_rating','L'), NULLIF(p->>'age_notes',''),
    COALESCE(p->>'highlight_type','none')::highlight_type, COALESCE(p->>'is_sponsored','false')::boolean,
    p->'ticketing', p->'ticket_rules', p->'links', p->'accessibility', 
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'gallery')), '{}'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'tags')), '{}'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'genres')), '{}'),
    COALESCE(p->>'status','draft')::agenda_status, NULLIF(p->>'publish_at','')::timestamptz,
    NULLIF(p->>'seo_title',''), NULLIF(p->>'seo_description',''), NULLIF(p->>'og_image_url',''),
    NULL, NULLIF(p->>'edition_number','')::int, (p->>'created_by')::uuid
  ) RETURNING id INTO v_event_id;

  -- 2) série (cria se veio nome)
  IF p ? 'series' THEN
    v_series_id := (p->'series'->>'id')::uuid;
    IF v_series_id IS NULL AND COALESCE(p->'series'->>'name','') <> '' THEN
      INSERT INTO public.event_series(name, slug, description, cover_url)
      VALUES( p->'series'->>'name', public.fn_slugify(p->'series'->>'name'), p->'series'->>'description', p->'series'->>'cover_url')
      ON CONFLICT(slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id INTO v_series_id;
    END IF;
    IF v_series_id IS NOT NULL THEN
      INSERT INTO public.event_series_items(series_id, event_id, edition_number)
      VALUES(v_series_id, v_event_id, NULLIF(p->>'edition_number','')::int)
      ON CONFLICT DO NOTHING;
      UPDATE public.agenda_itens SET series_id = v_series_id WHERE id = v_event_id;
    END IF;
  END IF;

  -- 3) parceiros
  IF p ? 'organizers' THEN
    INSERT INTO public.event_partners(event_id, agent_id, name, role, is_primary)
    SELECT v_event_id, NULLIF(j->>'agent_id','')::uuid, NULLIF(j->>'name',''), 'organizer'::public.partner_role,
           COALESCE((j->>'is_primary')::boolean, false)
    FROM jsonb_array_elements(p->'organizers') j;
  END IF;
  IF p ? 'supporters' THEN
    INSERT INTO public.event_partners(event_id, agent_id, name, role, tier)
    SELECT v_event_id, NULLIF(j->>'agent_id','')::uuid, NULLIF(j->>'name',''), 'supporter'::public.partner_role, j->>'tier'
    FROM jsonb_array_elements(p->'supporters') j;
  END IF;
  IF p ? 'sponsors' THEN
    INSERT INTO public.event_partners(event_id, agent_id, name, role, tier)
    SELECT v_event_id, NULLIF(j->>'agent_id','')::uuid, NULLIF(j->>'name',''), 'sponsor'::public.partner_role, j->>'tier'
    FROM jsonb_array_elements(p->'sponsors') j;
  END IF;

  -- 4) lineup slots e B2B
  IF p ? 'lineup' THEN
    i := 0;
    FOR slot IN SELECT * FROM jsonb_array_elements(p->'lineup') LOOP
      i := i + 1;
      INSERT INTO public.event_lineup_slots(event_id, stage, starts_at, ends_at, notes, position)
      VALUES(v_event_id, slot->>'stage', NULLIF(slot->>'starts_at','')::timestamptz, NULLIF(slot->>'ends_at','')::timestamptz, slot->>'notes', i)
      RETURNING id INTO v_slot_id;
      IF slot ? 'artists' THEN
        INSERT INTO public.event_lineup_slot_artists(slot_id, artist_id, display_name, ord)
        SELECT v_slot_id, NULLIF(a->>'artist_id','')::uuid, NULLIF(a->>'display_name',''), COALESCE((a->>'ord')::int, 1)
        FROM jsonb_array_elements(slot->'artists') a;
      END IF;
    END LOOP;
  END IF;

  -- 5) performances
  IF p ? 'performances' THEN
    INSERT INTO public.event_performances(event_id, name, kind, starts_at, stage, notes)
    SELECT v_event_id, j->>'name', j->>'kind', NULLIF(j->>'starts_at','')::timestamptz, j->>'stage', j->>'notes'
    FROM jsonb_array_elements(p->'performances') j;
  END IF;

  -- 6) artistas visuais
  IF p ? 'visual_artists' THEN
    INSERT INTO public.event_visual_artists(event_id, name, work, portfolio_url)
    SELECT v_event_id, j->>'name', j->>'work', j->>'portfolio_url'
    FROM jsonb_array_elements(p->'visual_artists') j;
  END IF;

  RETURN v_event_id; END; $$;