-- Corrigir função RPC upsert_artist_review para verificar id ao invés de user_id
CREATE OR REPLACE FUNCTION public.upsert_artist_review(
  p_profile_user_id uuid,
  p_rating integer,
  p_comment text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  profile_user_id uuid,
  reviewer_id uuid,
  rating integer,
  comment text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  review_record profile_reviews;
BEGIN
  -- Verificar se usuário está autenticado
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating deve estar entre 1 e 5';
  END IF;

  -- CORREÇÃO: Verificar se perfil existe usando id ao invés de user_id
  IF NOT EXISTS (
    SELECT 1 FROM entity_profiles 
    WHERE id = p_profile_user_id
  ) THEN
    RAISE EXCEPTION 'ID do perfil não encontrado';
  END IF;

  -- Verificar se usuário não está tentando avaliar a si mesmo
  IF EXISTS (
    SELECT 1 FROM entity_profiles 
    WHERE id = p_profile_user_id AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Não é possível avaliar seu próprio perfil';
  END IF;

  -- Fazer upsert da avaliação
  INSERT INTO profile_reviews (
    profile_user_id,
    reviewer_id,
    rating,
    comment
  ) VALUES (
    p_profile_user_id,
    current_user_id,
    p_rating,
    p_comment
  )
  ON CONFLICT (profile_user_id, reviewer_id) 
  DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    updated_at = NOW()
  RETURNING * INTO review_record;

  -- Retornar o resultado
  RETURN QUERY
  SELECT 
    review_record.id,
    review_record.profile_user_id,
    review_record.reviewer_id,
    review_record.rating,
    review_record.comment,
    review_record.created_at,
    review_record.updated_at;
END;
$$;