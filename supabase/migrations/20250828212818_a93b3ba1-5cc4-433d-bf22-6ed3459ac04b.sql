-- ETAPA 1: CRIAR ENUMS NECESSÁRIOS
CREATE TYPE highlight_status AS ENUM ('draft', 'published');
CREATE TYPE event_status AS ENUM ('draft', 'published');

-- ETAPA 2: AJUSTAR TABELA HIGHLIGHTS
-- Adicionar campos em falta
ALTER TABLE public.highlights 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS status highlight_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Criar índice único para slug (se não existir)
CREATE UNIQUE INDEX IF NOT EXISTS highlights_slug_unique_idx ON public.highlights(slug);

-- ETAPA 3: AJUSTAR TABELA EVENTS
-- Adicionar campos em falta
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS status event_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Garantir que slug existe e é único
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique_idx ON public.events(slug);

-- ETAPA 4: AJUSTAR TABELA ORGANIZERS
-- Adicionar campos em falta
ALTER TABLE public.organizers 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS site_url TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Criar índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS organizers_slug_unique_idx ON public.organizers(slug);

-- ETAPA 5: AJUSTAR TABELA VENUES
-- Adicionar campos em falta
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Criar índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS venues_slug_unique_idx ON public.venues(slug);

-- ETAPA 6: CRIAR FUNÇÃO PARA GERAR SLUGS ÚNICOS
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, table_name TEXT, id_to_exclude UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slug_candidate TEXT;
  slug_exists BOOLEAN;
  counter INTEGER := 1;
BEGIN
  -- Gerar slug base
  slug_candidate := lower(trim(regexp_replace(base_text, '[^a-zA-Z0-9\s]', '', 'g')));
  slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
  slug_candidate := trim(slug_candidate, '-');
  
  -- Verificar se slug já existe
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND ($2 IS NULL OR id != $2))', table_name)
    INTO slug_exists
    USING slug_candidate, id_to_exclude;
    
    IF NOT slug_exists THEN
      EXIT;
    END IF;
    
    slug_candidate := regexp_replace(base_text, '[^a-zA-Z0-9\s]', '', 'g');
    slug_candidate := lower(trim(regexp_replace(slug_candidate, '\s+', '-', 'g'), '-'));
    slug_candidate := slug_candidate || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN slug_candidate;
END;
$$;

-- ETAPA 7: FUNÇÃO PARA TOGGLE STATUS DE HIGHLIGHTS
CREATE OR REPLACE FUNCTION public.admin_toggle_highlight_published(p_highlight_id UUID)
RETURNS TABLE(id UUID, status highlight_status)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status highlight_status;
  new_status highlight_status;
BEGIN
  -- Verificar se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin/editor necessária';
  END IF;

  -- Obter status atual
  SELECT h.status INTO current_status
  FROM public.highlights h
  WHERE h.id = p_highlight_id;

  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Highlight não encontrado';
  END IF;

  -- Determinar novo status
  new_status := CASE 
    WHEN current_status = 'draft' THEN 'published'::highlight_status
    ELSE 'draft'::highlight_status
  END;

  -- Atualizar status
  UPDATE public.highlights 
  SET 
    status = new_status,
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE highlights.id = p_highlight_id;

  -- Retornar resultado
  RETURN QUERY
  SELECT h.id, h.status
  FROM public.highlights h
  WHERE h.id = p_highlight_id;
END;
$$;

-- ETAPA 8: FUNÇÃO PARA DELETAR HIGHLIGHTS
CREATE OR REPLACE FUNCTION public.admin_delete_highlight(p_highlight_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin/editor necessária';
  END IF;

  -- Verificar se highlight existe
  IF NOT EXISTS (SELECT 1 FROM public.highlights WHERE id = p_highlight_id) THEN
    RAISE EXCEPTION 'Highlight não encontrado';
  END IF;

  -- Deletar highlight
  DELETE FROM public.highlights WHERE id = p_highlight_id;

  RETURN TRUE;
END;
$$;

-- ETAPA 9: FUNÇÕES EQUIVALENTES PARA EVENTS
CREATE OR REPLACE FUNCTION public.admin_toggle_event_published(p_event_id UUID)
RETURNS TABLE(id UUID, status event_status)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status event_status;
  new_status event_status;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin/editor necessária';
  END IF;

  SELECT e.status INTO current_status
  FROM public.events e
  WHERE e.id = p_event_id;

  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Evento não encontrado';
  END IF;

  new_status := CASE 
    WHEN current_status = 'draft' THEN 'published'::event_status
    ELSE 'draft'::event_status
  END;

  UPDATE public.events 
  SET 
    status = new_status,
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE events.id = p_event_id;

  RETURN QUERY
  SELECT e.id, e.status
  FROM public.events e
  WHERE e.id = p_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_event(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin/editor necessária';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.events WHERE id = p_event_id) THEN
    RAISE EXCEPTION 'Evento não encontrado';
  END IF;

  DELETE FROM public.events WHERE id = p_event_id;
  RETURN TRUE;
END;
$$;

-- ETAPA 10: FUNÇÕES PARA ORGANIZERS
CREATE OR REPLACE FUNCTION public.admin_delete_organizer(p_organizer_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin/editor necessária';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.organizers WHERE id = p_organizer_id) THEN
    RAISE EXCEPTION 'Organizador não encontrado';
  END IF;

  DELETE FROM public.organizers WHERE id = p_organizer_id;
  RETURN TRUE;
END;
$$;

-- ETAPA 11: FUNÇÕES PARA VENUES
CREATE OR REPLACE FUNCTION public.admin_delete_venue(p_venue_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissão de admin/editor necessária';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.venues WHERE id = p_venue_id) THEN
    RAISE EXCEPTION 'Local não encontrado';
  END IF;

  DELETE FROM public.venues WHERE id = p_venue_id;
  RETURN TRUE;
END;
$$;

-- ETAPA 12: TRIGGERS PARA UPDATED_AT AUTOMÁTICO
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aplicar triggers em todas as tabelas principais
DROP TRIGGER IF EXISTS trigger_highlights_updated_at ON public.highlights;
CREATE TRIGGER trigger_highlights_updated_at
  BEFORE UPDATE ON public.highlights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_organizers_updated_at ON public.organizers;
CREATE TRIGGER trigger_organizers_updated_at
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_venues_updated_at ON public.venues;
CREATE TRIGGER trigger_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ETAPA 13: ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS highlights_start_at_idx ON public.highlights(start_at);
CREATE INDEX IF NOT EXISTS highlights_city_idx ON public.highlights(city);
CREATE INDEX IF NOT EXISTS highlights_status_idx ON public.highlights(status);

CREATE INDEX IF NOT EXISTS events_start_at_idx ON public.events(start_at);
CREATE INDEX IF NOT EXISTS events_city_idx ON public.events(city);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);

CREATE INDEX IF NOT EXISTS organizers_name_idx ON public.organizers(name);
CREATE INDEX IF NOT EXISTS venues_name_idx ON public.venues(name);
CREATE INDEX IF NOT EXISTS venues_city_idx ON public.venues(city);