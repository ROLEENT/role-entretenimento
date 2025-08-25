-- Criar função para incrementar likes nos destaques
CREATE OR REPLACE FUNCTION public.increment_highlight_likes(highlight_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.highlights 
  SET like_count = COALESCE(like_count, 0) + 1
  WHERE id = highlight_id;
END;
$$;