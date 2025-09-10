-- ETAPA 4: Correção final das funções restantes sem search_path

CREATE OR REPLACE FUNCTION public.upsert_event_criteria(p_event_id uuid, p_notes text, p_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  r JSONB;
BEGIN
  -- Atualizar notas
  UPDATE public.events 
  SET curation_notes = p_notes 
  WHERE id = p_event_id;

  -- Upsert critérios
  FOR r IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.event_curation_criteria(event_id, key, status, is_primary)
    VALUES (
      p_event_id,
      (r->>'key')::criterion_key,
      (r->>'status')::criterion_status,
      COALESCE((r->>'is_primary')::BOOLEAN, false)
    )
    ON CONFLICT (event_id, key) DO UPDATE
    SET status = EXCLUDED.status,
        is_primary = EXCLUDED.is_primary;
  END LOOP;

  PERFORM public.recalc_event_curation_score(p_event_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.recalc_event_curation_score(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_score NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE status
      WHEN 'met' THEN 1.0
      WHEN 'partial' THEN 0.5
      ELSE 0.0
    END
  ), 0)
  INTO v_score
  FROM public.event_curation_criteria
  WHERE event_id = p_event_id;

  UPDATE public.events
  SET curation_score = ROUND(v_score)::INTEGER
  WHERE id = p_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_username(new_username text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se username tem formato válido (apenas letras, números e underscore)
  IF new_username !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN false;
  END IF;
  
  -- Verificar tamanho (3-30 caracteres)
  IF length(new_username) < 3 OR length(new_username) > 30 THEN
    RETURN false;
  END IF;
  
  -- Verificar se não está em uso
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Testar função crítica de admin delete event
SELECT public.admin_delete_event('fiih@roleentretenimento.com', '00000000-0000-0000-0000-000000000000'::uuid) as test_admin_function;