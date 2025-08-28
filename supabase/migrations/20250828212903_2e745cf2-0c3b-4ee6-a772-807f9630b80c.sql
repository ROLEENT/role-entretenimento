-- CORREÇÃO DOS WARNINGS DE SEGURANÇA: Adicionar search_path às funções

-- Corrigir função generate_unique_slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, table_name TEXT, id_to_exclude UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função admin_toggle_highlight_published
CREATE OR REPLACE FUNCTION public.admin_toggle_highlight_published(p_highlight_id UUID)
RETURNS TABLE(id UUID, status highlight_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função admin_delete_highlight
CREATE OR REPLACE FUNCTION public.admin_delete_highlight(p_highlight_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função admin_toggle_event_published
CREATE OR REPLACE FUNCTION public.admin_toggle_event_published(p_event_id UUID)
RETURNS TABLE(id UUID, status event_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função admin_delete_event
CREATE OR REPLACE FUNCTION public.admin_delete_event(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função admin_delete_organizer
CREATE OR REPLACE FUNCTION public.admin_delete_organizer(p_organizer_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função admin_delete_venue
CREATE OR REPLACE FUNCTION public.admin_delete_venue(p_venue_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;