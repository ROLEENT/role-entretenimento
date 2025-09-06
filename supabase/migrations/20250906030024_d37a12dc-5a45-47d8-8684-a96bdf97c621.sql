-- Criar funções RPC para bulk operations na agenda

-- Função para soft delete de múltiplos itens da agenda
CREATE OR REPLACE FUNCTION bulk_delete_agenda_items(item_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se admin é válido
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Soft delete (marcar como deletado)
  UPDATE agenda_itens
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = ANY(item_ids) 
    AND deleted_at IS NULL;
END;
$$;

-- Função para restaurar múltiplos itens da agenda
CREATE OR REPLACE FUNCTION bulk_restore_agenda_items(item_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se admin é válido
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Restaurar (remover soft delete)
  UPDATE agenda_itens
  SET deleted_at = NULL,
      updated_at = NOW()
  WHERE id = ANY(item_ids) 
    AND deleted_at IS NOT NULL;
END;
$$;

-- Função para atualizar status de múltiplos itens
CREATE OR REPLACE FUNCTION bulk_update_agenda_status(item_ids uuid[], new_status agenda_status)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se admin é válido
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Atualizar status
  UPDATE agenda_itens
  SET status = new_status,
      updated_at = NOW(),
      published_at = CASE 
        WHEN new_status = 'published' AND published_at IS NULL 
        THEN NOW() 
        ELSE published_at 
      END
  WHERE id = ANY(item_ids) 
    AND deleted_at IS NULL;
END;
$$;

-- Função para obter estatísticas da agenda
CREATE OR REPLACE FUNCTION get_agenda_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  total_count integer;
  published_count integer;
  draft_count integer;
  scheduled_count integer;
  archived_count integer;
  this_week_count integer;
  start_of_week timestamp with time zone;
BEGIN
  -- Calcular início da semana
  start_of_week := date_trunc('week', now());

  -- Contar por status (apenas itens não deletados)
  SELECT 
    COUNT(*) FILTER (WHERE deleted_at IS NULL),
    COUNT(*) FILTER (WHERE status = 'published' AND deleted_at IS NULL),
    COUNT(*) FILTER (WHERE status = 'draft' AND deleted_at IS NULL),
    COUNT(*) FILTER (WHERE status = 'scheduled' AND deleted_at IS NULL),
    COUNT(*) FILTER (WHERE status = 'archived' AND deleted_at IS NULL),
    COUNT(*) FILTER (WHERE created_at >= start_of_week AND deleted_at IS NULL)
  INTO total_count, published_count, draft_count, scheduled_count, archived_count, this_week_count
  FROM agenda_itens;

  result := jsonb_build_object(
    'total', total_count,
    'published', published_count,
    'drafts', draft_count,
    'scheduled', scheduled_count,
    'archived', archived_count,
    'thisWeek', this_week_count
  );

  RETURN result;
END;
$$;

-- Função para duplicar item da agenda
CREATE OR REPLACE FUNCTION duplicate_agenda_item(item_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_id uuid;
  original_item agenda_itens%ROWTYPE;
  new_slug text;
  slug_counter integer := 1;
BEGIN
  -- Verificar se admin é válido
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Buscar item original
  SELECT * INTO original_item
  FROM agenda_itens
  WHERE id = item_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agenda item not found or deleted';
  END IF;

  -- Gerar novo ID
  new_id := gen_random_uuid();

  -- Gerar slug único
  new_slug := original_item.slug || '-copy';
  WHILE EXISTS (SELECT 1 FROM agenda_itens WHERE slug = new_slug) LOOP
    new_slug := original_item.slug || '-copy-' || slug_counter;
    slug_counter := slug_counter + 1;
  END LOOP;

  -- Inserir nova cópia
  INSERT INTO agenda_itens (
    id, title, slug, subtitle, summary, city, status, 
    visibility_type, starts_at, end_at, price_min, price_max,
    currency, location_name, address, neighborhood, ticket_url,
    cover_url, alt_text, tags, organizer_id, venue_id,
    created_at, updated_at
  ) VALUES (
    new_id,
    original_item.title || ' (Cópia)',
    new_slug,
    original_item.subtitle,
    original_item.summary,
    original_item.city,
    'draft', -- Sempre criar cópia como rascunho
    original_item.visibility_type,
    original_item.starts_at,
    original_item.end_at,
    original_item.price_min,
    original_item.price_max,
    original_item.currency,
    original_item.location_name,
    original_item.address,
    original_item.neighborhood,
    original_item.ticket_url,
    original_item.cover_url,
    original_item.alt_text,
    original_item.tags,
    original_item.organizer_id,
    original_item.venue_id,
    NOW(),
    NOW()
  );

  RETURN new_id;
END;
$$;