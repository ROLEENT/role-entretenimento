-- Limpar funções RPC duplicadas de highlights
-- Remover versões duplicadas mantendo apenas a mais recente

-- Primeiro, vamos verificar todas as funções admin_create_highlight_v2
-- e remover as duplicadas, mantendo apenas uma versão

-- Remover função admin_create_highlight_v2 duplicada
DROP FUNCTION IF EXISTS public.admin_create_highlight_v2(text, city, text, text, text, character varying, text[], text, text, text, text, text, integer, boolean);

-- Remover função admin_update_highlight_v2 duplicada  
DROP FUNCTION IF EXISTS public.admin_update_highlight_v2(text, uuid, city, text, text, text, character varying, text[], text, text, text, text, text, integer, boolean);

-- Remover função admin_delete_highlight se existir (não listada nos logs mas pode estar causando conflito)
DROP FUNCTION IF EXISTS public.admin_delete_highlight(text, uuid);

-- Criar versão final e limpa das funções RPC que faltam

-- Função para deletar highlights
CREATE OR REPLACE FUNCTION public.admin_delete_highlight(p_admin_email text, p_highlight_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o admin existe e está ativo
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  -- Verificar se o highlight existe
  IF NOT EXISTS (
    SELECT 1 FROM public.highlights WHERE id = p_highlight_id
  ) THEN
    RAISE EXCEPTION 'Destaque não encontrado';
  END IF;

  -- Deletar o highlight
  DELETE FROM public.highlights WHERE id = p_highlight_id;

  RETURN true;
END;
$function$;

-- Função para listar highlights para admin
CREATE OR REPLACE FUNCTION public.admin_get_highlights(p_admin_email text)
RETURNS TABLE(
  id uuid, 
  city city, 
  event_title text, 
  venue text, 
  ticket_url text, 
  role_text character varying, 
  selection_reasons text[], 
  image_url text, 
  photo_credit text, 
  event_date date, 
  event_time time without time zone, 
  ticket_price text, 
  sort_order integer, 
  is_published boolean, 
  like_count integer, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o admin existe e está ativo
  IF NOT is_admin_session_valid(p_admin_email) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo';
  END IF;

  RETURN QUERY
  SELECT 
    h.id, h.city, h.event_title, h.venue, h.ticket_url, h.role_text,
    h.selection_reasons, h.image_url, h.photo_credit, h.event_date,
    h.event_time, h.ticket_price, h.sort_order, h.is_published,
    h.like_count, h.created_at, h.updated_at
  FROM public.highlights h
  ORDER BY h.created_at DESC;
END;
$function$;