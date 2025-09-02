-- CORREÇÃO COMPLETA: Banco de Dados + Acessibilidade

-- Primeiro, verificar e corrigir constraints duplicados
-- Remover constraint desnecessário se existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profile_reviews_reviewer_profile_uniq' 
        AND table_name = 'profile_reviews'
    ) THEN
        ALTER TABLE public.profile_reviews DROP CONSTRAINT profile_reviews_reviewer_profile_uniq;
    END IF;
END $$;

-- Garantir que existe a constraint principal (única necessária)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profile_reviews_profile_user_id_reviewer_id_key' 
        AND table_name = 'profile_reviews'
    ) THEN
        ALTER TABLE public.profile_reviews 
        ADD CONSTRAINT profile_reviews_profile_user_id_reviewer_id_key 
        UNIQUE (profile_user_id, reviewer_id);
    END IF;
END $$;

-- Corrigir RLS policies
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.profile_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.profile_reviews;

-- Política INSERT correta
CREATE POLICY "Users can insert their own reviews" ON public.profile_reviews
FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    auth.uid() IS NOT NULL AND
    profile_user_id IS NOT NULL AND
    rating >= 1 AND rating <= 5
);

-- Política UPDATE correta
CREATE POLICY "Users can update their own reviews" ON public.profile_reviews
FOR UPDATE USING (
    auth.uid() = reviewer_id
) WITH CHECK (
    auth.uid() = reviewer_id AND
    rating >= 1 AND rating <= 5
);

-- Recriar função RPC com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.upsert_profile_review(
  p_profile_user_id uuid,
  p_rating int,
  p_comment text default null
) RETURNS public.profile_reviews
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE 
  r public.profile_reviews;
  user_authenticated uuid;
BEGIN
  -- Log para debugging
  RAISE NOTICE 'Starting upsert_profile_review for user %, profile %, rating %', auth.uid(), p_profile_user_id, p_rating;
  
  -- Verificar autenticação
  user_authenticated := auth.uid();
  IF user_authenticated IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar parâmetros  
  IF p_profile_user_id IS NULL THEN
    RAISE EXCEPTION 'ID do perfil é obrigatório';
  END IF;
  
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating deve estar entre 1 e 5';
  END IF;

  -- Verificar se profile existe
  IF NOT EXISTS (SELECT 1 FROM public.entity_profiles WHERE user_id = p_profile_user_id) THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  -- Tentar inserir primeiro, depois update se houver conflito
  BEGIN
    INSERT INTO public.profile_reviews(
      reviewer_id, 
      profile_user_id, 
      rating, 
      comment,
      created_at,
      updated_at
    )
    VALUES (
      user_authenticated, 
      p_profile_user_id, 
      p_rating, 
      p_comment,
      now(),
      now()
    )
    RETURNING * INTO r;
    
    RAISE NOTICE 'Review created successfully for user %', user_authenticated;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- Se já existe, fazer update
      UPDATE public.profile_reviews SET
        rating = p_rating,
        comment = p_comment,
        updated_at = now()
      WHERE profile_user_id = p_profile_user_id 
        AND reviewer_id = user_authenticated
      RETURNING * INTO r;
      
      RAISE NOTICE 'Review updated successfully for user %', user_authenticated;
  END;
  
  IF r IS NULL THEN
    RAISE EXCEPTION 'Falha ao salvar avaliação';
  END IF;
  
  RETURN r;
END $$;