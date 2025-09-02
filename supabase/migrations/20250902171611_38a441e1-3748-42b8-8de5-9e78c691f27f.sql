-- Corrigir função upsert_artist_review para eliminar ambiguidade de colunas
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
SET search_path = public
AS $$
DECLARE
    review_record profile_reviews%ROWTYPE;
BEGIN
    -- Validar se usuário está autenticado
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Validar rating
    IF p_rating < 1 OR p_rating > 5 THEN
        RAISE EXCEPTION 'Rating deve estar entre 1 e 5';
    END IF;
    
    -- Validar se profile_user_id existe
    IF NOT EXISTS (SELECT 1 FROM entity_profiles WHERE entity_profiles.id = p_profile_user_id) THEN
        RAISE EXCEPTION 'ID do perfil inválido: %', p_profile_user_id;
    END IF;
    
    -- Fazer upsert da avaliação
    INSERT INTO profile_reviews (
        profile_user_id,
        reviewer_id,
        rating,
        comment,
        created_at,
        updated_at
    ) VALUES (
        p_profile_user_id,
        auth.uid(),
        p_rating,
        p_comment,
        NOW(),
        NOW()
    )
    ON CONFLICT (profile_user_id, reviewer_id)
    DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        updated_at = NOW()
    RETURNING * INTO review_record;
    
    -- Retornar dados específicos da tabela profile_reviews
    RETURN QUERY SELECT
        review_record.id,
        review_record.profile_user_id,
        review_record.reviewer_id,
        review_record.rating,
        review_record.comment,
        review_record.created_at,
        review_record.updated_at;
END;
$$;