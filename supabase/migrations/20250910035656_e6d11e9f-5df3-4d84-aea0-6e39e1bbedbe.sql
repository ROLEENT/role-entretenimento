-- CORREÇÃO DOS ERROS DE AGENDA

-- 1. Criar as funções RPC que estão faltando ou com erro

-- 1.1. Função get_agenda_stats (recriação para corrigir erro 400)
CREATE OR REPLACE FUNCTION public.get_agenda_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  total_count integer;
  published_count integer;
  drafts_count integer;
  scheduled_count integer;
  archived_count integer;
  this_week_count integer;
  start_of_week timestamp with time zone;
BEGIN
  -- Verificar se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Calcular início da semana
  start_of_week := date_trunc('week', CURRENT_DATE);

  -- Contar todos os itens não deletados
  SELECT COUNT(*) INTO total_count
  FROM agenda_itens 
  WHERE deleted_at IS NULL;

  -- Contar por status
  SELECT COUNT(*) INTO published_count
  FROM agenda_itens 
  WHERE deleted_at IS NULL AND status = 'published';

  SELECT COUNT(*) INTO drafts_count
  FROM agenda_itens 
  WHERE deleted_at IS NULL AND status = 'draft';

  SELECT COUNT(*) INTO scheduled_count
  FROM agenda_itens 
  WHERE deleted_at IS NULL AND status = 'scheduled';

  SELECT COUNT(*) INTO archived_count
  FROM agenda_itens 
  WHERE deleted_at IS NULL AND status = 'archived';

  -- Contar eventos desta semana
  SELECT COUNT(*) INTO this_week_count
  FROM agenda_itens 
  WHERE deleted_at IS NULL 
  AND created_at >= start_of_week;

  -- Construir resultado
  result := jsonb_build_object(
    'total', total_count,
    'published', published_count,
    'drafts', drafts_count,
    'scheduled', scheduled_count,
    'archived', archived_count,
    'thisWeek', this_week_count
  );

  RETURN result;
END;
$$;

-- 1.2. Função bulk_delete_agenda_items (se não existir)
CREATE OR REPLACE FUNCTION public.bulk_delete_agenda_items(item_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Soft delete dos itens
  UPDATE agenda_itens 
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = ANY(item_ids) AND deleted_at IS NULL;
END;
$$;

-- 1.3. Função bulk_restore_agenda_items (se não existir)
CREATE OR REPLACE FUNCTION public.bulk_restore_agenda_items(item_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Restaurar itens
  UPDATE agenda_itens 
  SET deleted_at = NULL, updated_at = NOW()
  WHERE id = ANY(item_ids) AND deleted_at IS NOT NULL;
END;
$$;

-- 1.4. Função bulk_update_agenda_status (se não existir)
CREATE OR REPLACE FUNCTION public.bulk_update_agenda_status(item_ids uuid[], new_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Atualizar status dos itens
  UPDATE agenda_itens 
  SET status = new_status::agenda_status, updated_at = NOW()
  WHERE id = ANY(item_ids) AND deleted_at IS NULL;
END;
$$;

-- 1.5. Função duplicate_agenda_item (se não existir)
CREATE OR REPLACE FUNCTION public.duplicate_agenda_item(item_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_id uuid;
  original_item agenda_itens%ROWTYPE;
  new_slug text;
  counter integer := 1;
BEGIN
  -- Verificar se usuário é admin
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
    RAISE EXCEPTION 'Item not found or deleted';
  END IF;

  -- Gerar novo slug único
  new_slug := original_item.slug || '-copia';
  WHILE EXISTS (SELECT 1 FROM agenda_itens WHERE slug = new_slug) LOOP
    new_slug := original_item.slug || '-copia-' || counter;
    counter := counter + 1;
  END LOOP;

  -- Criar novo item
  INSERT INTO agenda_itens (
    title, subtitle, summary, city, status, visibility_type,
    starts_at, end_at, price_min, price_max, currency,
    location_name, address, neighborhood, ticket_url,
    cover_url, alt_text, tags, slug
  ) VALUES (
    original_item.title || ' (Cópia)',
    original_item.subtitle,
    original_item.summary,
    original_item.city,
    'draft'::agenda_status,
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
    new_slug
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;