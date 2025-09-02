-- Criar função RPC para upsert atômico de avaliações de perfil
-- Elimina problema de ordem das colunas e garante operação 100% atômica

CREATE OR REPLACE FUNCTION public.upsert_profile_review(
  p_profile_user_id uuid,
  p_rating int,
  p_comment text default null
) RETURNS public.profile_reviews
LANGUAGE plpgsql SECURITY DEFINER 
SET search_path TO 'public'
AS $$
DECLARE 
  r public.profile_reviews;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar parâmetros
  IF p_profile_user_id IS NULL THEN
    RAISE EXCEPTION 'ID do perfil é obrigatório';
  END IF;
  
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating deve estar entre 1 e 5';
  END IF;

  -- Upsert atômico usando ON CONFLICT
  INSERT INTO public.profile_reviews(
    reviewer_id, 
    profile_user_id, 
    rating, 
    comment,
    created_at,
    updated_at
  )
  VALUES (
    auth.uid(), 
    p_profile_user_id, 
    p_rating, 
    p_comment,
    now(),
    now()
  )
  ON CONFLICT (profile_user_id, reviewer_id)
  DO UPDATE SET 
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    updated_at = now()
  RETURNING * INTO r;
  
  RETURN r;
END $$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.upsert_profile_review(uuid,int,text) TO authenticated;

-- Garantir que as constraints necessárias existem
-- Verificar se constraint única existe, caso contrário criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profile_reviews_reviewer_profile_uniq'
  ) THEN
    -- Primeiro, remover duplicatas se existirem
    DELETE FROM public.profile_reviews t1
    USING public.profile_reviews t2
    WHERE t1.ctid < t2.ctid
      AND t1.reviewer_id = t2.reviewer_id
      AND t1.profile_user_id = t2.profile_user_id;
    
    -- Criar constraint única
    ALTER TABLE public.profile_reviews
      ADD CONSTRAINT profile_reviews_reviewer_profile_uniq
      UNIQUE (profile_user_id, reviewer_id);
  END IF;
END $$;

-- Recarregar PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';