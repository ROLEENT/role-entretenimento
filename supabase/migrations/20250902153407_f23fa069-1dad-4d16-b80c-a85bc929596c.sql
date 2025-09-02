-- Corrigir warnings de segurança específicos da migração

-- 1. Corrigir função com search_path mutable
-- Recriar a função com search_path fixo para maior segurança
CREATE OR REPLACE FUNCTION public.upsert_profile_review(
  p_profile_user_id uuid,
  p_rating int,
  p_comment text default null
) RETURNS public.profile_reviews
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'  -- Fixar search_path para segurança
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

-- Comentário: Os outros warnings (AUTH OTP expiry e Leaked Password Protection) 
-- são configurações de nível de projeto que devem ser ajustadas pelo usuário
-- no painel de administração do Supabase, não via SQL