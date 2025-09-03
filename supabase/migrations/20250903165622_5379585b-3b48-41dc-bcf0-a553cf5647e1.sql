-- Fase 2: Estrutura Completa do Banco de Dados

-- 1. Criar enums em falta
CREATE TYPE age_rating AS ENUM ('L', '10', '12', '14', '16', '18');
CREATE TYPE partner_role AS ENUM ('organizer', 'supporter', 'sponsor');

-- 2. Atualizar tabela events com campos avançados
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS doors_open_utc timestamptz,
ADD COLUMN IF NOT EXISTS headliner_starts_utc timestamptz,
ADD COLUMN IF NOT EXISTS ticket_rules jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS age_notes text,
ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.event_series(id),
ADD COLUMN IF NOT EXISTS edition_number integer,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS og_image_url text,
ADD COLUMN IF NOT EXISTS highlight_type highlight_type DEFAULT 'none',
ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ticketing jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS accessibility jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS cover_alt text,
ADD COLUMN IF NOT EXISTS genres text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS age_rating age_rating;

-- 3. Criar tabelas relacionais

-- Tabela de parceiros do evento
CREATE TABLE IF NOT EXISTS public.event_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL,
  partner_type text NOT NULL CHECK (partner_type IN ('organizer', 'venue', 'artist')),
  role partner_role NOT NULL DEFAULT 'organizer',
  display_name text,
  position integer DEFAULT 0,
  is_main boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de slots de lineup
CREATE TABLE IF NOT EXISTS public.event_lineup_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  slot_name text NOT NULL,
  start_time timestamptz,
  end_time timestamptz,
  stage text,
  position integer DEFAULT 0,
  is_headliner boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de artistas por slot (suporte a B2B)
CREATE TABLE IF NOT EXISTS public.event_lineup_slot_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES public.event_lineup_slots(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  artist_name text NOT NULL,
  position integer DEFAULT 0,
  role text DEFAULT 'performer',
  created_at timestamptz DEFAULT now(),
  UNIQUE(slot_id, artist_id)
);

-- Tabela de performances não-musicais
CREATE TABLE IF NOT EXISTS public.event_performances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  performer_name text NOT NULL,
  performance_type text NOT NULL,
  description text,
  start_time timestamptz,
  duration_minutes integer,
  stage text,
  position integer DEFAULT 0,
  contact_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de artistas visuais
CREATE TABLE IF NOT EXISTS public.event_visual_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  artist_name text NOT NULL,
  art_type text NOT NULL,
  description text,
  installation_location text,
  contact_info jsonb DEFAULT '{}'::jsonb,
  artwork_images jsonb DEFAULT '[]'::jsonb,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Criar função de slugify
CREATE OR REPLACE FUNCTION public.fn_slugify(input_text text)
RETURNS text AS $$
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN 'untitled-event';
  END IF;
  
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          unaccent(trim(input_text)), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Criar triggers para auto-slugify e validações
CREATE OR REPLACE FUNCTION public.auto_slugify_events()
RETURNS trigger AS $$
BEGIN
  -- Auto-generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := fn_slugify(NEW.title);
  END IF;
  
  -- Ensure unique slug
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = NEW.slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
    NEW.slug := NEW.slug || '-' || extract(epoch from now())::integer;
  END LOOP;
  
  -- Force is_sponsored when highlight_type is vitrine
  IF NEW.highlight_type = 'vitrine' THEN
    NEW.is_sponsored := true;
  END IF;
  
  -- Set updated_at
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_slugify_events ON public.events;
CREATE TRIGGER trigger_auto_slugify_events
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION auto_slugify_events();

-- 6. Criar RPC create_event_cascade
CREATE OR REPLACE FUNCTION public.create_event_cascade(
  event_data jsonb,
  partners jsonb DEFAULT '[]'::jsonb,
  lineup_slots jsonb DEFAULT '[]'::jsonb,
  performances jsonb DEFAULT '[]'::jsonb,
  visual_artists jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid AS $$
DECLARE
  new_event_id uuid;
  partner_item jsonb;
  slot_item jsonb;
  slot_id uuid;
  artist_item jsonb;
  performance_item jsonb;
  visual_item jsonb;
BEGIN
  -- 1. Criar evento principal
  INSERT INTO public.events (
    title, subtitle, summary, description,
    venue_id, location_name, address, city, state, country,
    date_start, date_end, doors_open_utc, headliner_starts_utc,
    image_url, cover_url, cover_alt, gallery,
    price_min, price_max, currency,
    ticket_url, ticketing, ticket_rules,
    age_rating, age_notes,
    genres, tags,
    highlight_type, is_sponsored,
    links, accessibility,
    seo_title, seo_description, og_image_url,
    series_id, edition_number,
    status, visibility
  )
  SELECT 
    (event_data->>'title')::text,
    (event_data->>'subtitle')::text,
    (event_data->>'summary')::text,
    (event_data->>'description')::text,
    (event_data->>'venue_id')::uuid,
    (event_data->>'location_name')::text,
    (event_data->>'address')::text,
    (event_data->>'city')::text,
    (event_data->>'state')::text,
    (event_data->>'country')::text,
    (event_data->>'date_start')::timestamptz,
    (event_data->>'date_end')::timestamptz,
    (event_data->>'doors_open_utc')::timestamptz,
    (event_data->>'headliner_starts_utc')::timestamptz,
    (event_data->>'image_url')::text,
    (event_data->>'cover_url')::text,
    (event_data->>'cover_alt')::text,
    COALESCE(event_data->'gallery', '[]'::jsonb),
    (event_data->>'price_min')::numeric,
    (event_data->>'price_max')::numeric,
    COALESCE((event_data->>'currency')::text, 'BRL'),
    (event_data->>'ticket_url')::text,
    COALESCE(event_data->'ticketing', '{}'::jsonb),
    COALESCE(event_data->'ticket_rules', '[]'::jsonb),
    (event_data->>'age_rating')::age_rating,
    (event_data->>'age_notes')::text,
    CASE 
      WHEN event_data->'genres' IS NOT NULL THEN 
        array(SELECT jsonb_array_elements_text(event_data->'genres'))
      ELSE '{}'::text[]
    END,
    CASE 
      WHEN event_data->'tags' IS NOT NULL THEN 
        array(SELECT jsonb_array_elements_text(event_data->'tags'))
      ELSE '{}'::text[]
    END,
    COALESCE((event_data->>'highlight_type')::highlight_type, 'none'),
    COALESCE((event_data->>'is_sponsored')::boolean, false),
    COALESCE(event_data->'links', '{}'::jsonb),
    COALESCE(event_data->'accessibility', '{}'::jsonb),
    (event_data->>'seo_title')::text,
    (event_data->>'seo_description')::text,
    (event_data->>'og_image_url')::text,
    (event_data->>'series_id')::uuid,
    (event_data->>'edition_number')::integer,
    COALESCE((event_data->>'status')::publication_status, 'draft'),
    COALESCE((event_data->>'visibility')::text, 'public')
  RETURNING id INTO new_event_id;

  -- 2. Criar parceiros
  FOR partner_item IN SELECT jsonb_array_elements(partners) LOOP
    INSERT INTO public.event_partners (
      event_id, partner_id, partner_type, role, display_name, position, is_main
    ) VALUES (
      new_event_id,
      (partner_item->>'partner_id')::uuid,
      (partner_item->>'partner_type')::text,
      (partner_item->>'role')::partner_role,
      (partner_item->>'display_name')::text,
      COALESCE((partner_item->>'position')::integer, 0),
      COALESCE((partner_item->>'is_main')::boolean, false)
    );
  END LOOP;

  -- 3. Criar slots de lineup
  FOR slot_item IN SELECT jsonb_array_elements(lineup_slots) LOOP
    INSERT INTO public.event_lineup_slots (
      event_id, slot_name, start_time, end_time, stage, position, is_headliner, notes
    ) VALUES (
      new_event_id,
      (slot_item->>'slot_name')::text,
      (slot_item->>'start_time')::timestamptz,
      (slot_item->>'end_time')::timestamptz,
      (slot_item->>'stage')::text,
      COALESCE((slot_item->>'position')::integer, 0),
      COALESCE((slot_item->>'is_headliner')::boolean, false),
      (slot_item->>'notes')::text
    ) RETURNING id INTO slot_id;
    
    -- Adicionar artistas ao slot
    IF slot_item->'artists' IS NOT NULL THEN
      FOR artist_item IN SELECT jsonb_array_elements(slot_item->'artists') LOOP
        INSERT INTO public.event_lineup_slot_artists (
          slot_id, artist_id, artist_name, position, role
        ) VALUES (
          slot_id,
          (artist_item->>'artist_id')::uuid,
          (artist_item->>'artist_name')::text,
          COALESCE((artist_item->>'position')::integer, 0),
          COALESCE((artist_item->>'role')::text, 'performer')
        );
      END LOOP;
    END IF;
  END LOOP;

  -- 4. Criar performances
  FOR performance_item IN SELECT jsonb_array_elements(performances) LOOP
    INSERT INTO public.event_performances (
      event_id, performer_name, performance_type, description,
      start_time, duration_minutes, stage, position, contact_info
    ) VALUES (
      new_event_id,
      (performance_item->>'performer_name')::text,
      (performance_item->>'performance_type')::text,
      (performance_item->>'description')::text,
      (performance_item->>'start_time')::timestamptz,
      (performance_item->>'duration_minutes')::integer,
      (performance_item->>'stage')::text,
      COALESCE((performance_item->>'position')::integer, 0),
      COALESCE(performance_item->'contact_info', '{}'::jsonb)
    );
  END LOOP;

  -- 5. Criar artistas visuais
  FOR visual_item IN SELECT jsonb_array_elements(visual_artists) LOOP
    INSERT INTO public.event_visual_artists (
      event_id, artist_name, art_type, description,
      installation_location, contact_info, artwork_images, position
    ) VALUES (
      new_event_id,
      (visual_item->>'artist_name')::text,
      (visual_item->>'art_type')::text,
      (visual_item->>'description')::text,
      (visual_item->>'installation_location')::text,
      COALESCE(visual_item->'contact_info', '{}'::jsonb),
      COALESCE(visual_item->'artwork_images', '[]'::jsonb),
      COALESCE((visual_item->>'position')::integer, 0)
    );
  END LOOP;

  RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Configurar RLS Policies

-- Events: Leitura pública para publicados, inserção pública como draft, admin full access
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published events" ON public.events;
CREATE POLICY "Public can read published events" ON public.events
  FOR SELECT USING (status = 'published' AND visibility = 'public');

DROP POLICY IF EXISTS "Public can create draft events" ON public.events;
CREATE POLICY "Public can create draft events" ON public.events
  FOR INSERT WITH CHECK (status = 'draft');

DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

-- Event Partners
ALTER TABLE public.event_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read event partners" ON public.event_partners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND status = 'published' AND visibility = 'public'
    )
  );

CREATE POLICY "Admins can manage event partners" ON public.event_partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

-- Event Lineup Slots
ALTER TABLE public.event_lineup_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read lineup slots" ON public.event_lineup_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND status = 'published' AND visibility = 'public'
    )
  );

CREATE POLICY "Admins can manage lineup slots" ON public.event_lineup_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

-- Event Lineup Slot Artists
ALTER TABLE public.event_lineup_slot_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read slot artists" ON public.event_lineup_slot_artists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.event_lineup_slots els
      JOIN public.events e ON e.id = els.event_id
      WHERE els.id = slot_id AND e.status = 'published' AND e.visibility = 'public'
    )
  );

CREATE POLICY "Admins can manage slot artists" ON public.event_lineup_slot_artists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

-- Event Performances
ALTER TABLE public.event_performances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read performances" ON public.event_performances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND status = 'published' AND visibility = 'public'
    )
  );

CREATE POLICY "Admins can manage performances" ON public.event_performances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

-- Event Visual Artists
ALTER TABLE public.event_visual_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visual artists" ON public.event_visual_artists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND status = 'published' AND visibility = 'public'
    )
  );

CREATE POLICY "Admins can manage visual artists" ON public.event_visual_artists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  );

-- Criar indexes para performance
CREATE INDEX IF NOT EXISTS idx_events_status_visibility ON public.events(status, visibility);
CREATE INDEX IF NOT EXISTS idx_events_date_start ON public.events(date_start);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_series_id ON public.events(series_id);
CREATE INDEX IF NOT EXISTS idx_event_partners_event_id ON public.event_partners(event_id);
CREATE INDEX IF NOT EXISTS idx_event_lineup_slots_event_id ON public.event_lineup_slots(event_id);
CREATE INDEX IF NOT EXISTS idx_event_lineup_slot_artists_slot_id ON public.event_lineup_slot_artists(slot_id);
CREATE INDEX IF NOT EXISTS idx_event_performances_event_id ON public.event_performances(event_id);
CREATE INDEX IF NOT EXISTS idx_event_visual_artists_event_id ON public.event_visual_artists(event_id);