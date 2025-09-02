-- RECONSTRUÇÃO COMPLETA: Sistema de Avaliações de Artistas
-- FASE 1: Limpeza e Estrutura do Banco

-- Limpar políticas RLS existentes
DROP POLICY IF EXISTS "Users can view profile reviews" ON public.profile_reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.profile_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.profile_reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.profile_reviews;

-- Remover função RPC anterior
DROP FUNCTION IF EXISTS public.upsert_profile_review(uuid, int, text);

-- Limpar constraints duplicados
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

-- Recriar tabela profile_reviews com estrutura limpa
DROP TABLE IF EXISTS public.profile_reviews CASCADE;

CREATE TABLE public.profile_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id uuid NOT NULL, -- ID do usuário do perfil sendo avaliado
  reviewer_id uuid NOT NULL,     -- ID do usuário que está avaliando
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Constraint único: uma avaliação por usuário por perfil
  UNIQUE(profile_user_id, reviewer_id)
);

-- Habilitar RLS
ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simples e claras
CREATE POLICY "Anyone can view reviews" ON public.profile_reviews
FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.profile_reviews
FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  auth.uid() IS NOT NULL AND
  profile_user_id IS NOT NULL AND
  profile_user_id != reviewer_id -- Não pode avaliar a si mesmo
);

CREATE POLICY "Users can update their own reviews" ON public.profile_reviews
FOR UPDATE USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON public.profile_reviews
FOR DELETE USING (auth.uid() = reviewer_id);

-- Função RPC simplificada e robusta
CREATE OR REPLACE FUNCTION public.upsert_artist_review(
  p_profile_user_id uuid,
  p_rating integer,
  p_comment text DEFAULT NULL
) 
RETURNS jsonb
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE 
  review_result public.profile_reviews;
  current_user_id uuid;
BEGIN
  -- Verificar autenticação
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar parâmetros  
  IF p_profile_user_id IS NULL THEN
    RAISE EXCEPTION 'ID do perfil é obrigatório';
  END IF;
  
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Avaliação deve ser entre 1 e 5 estrelas';
  END IF;

  -- Não pode avaliar a si mesmo
  IF p_profile_user_id = current_user_id THEN
    RAISE EXCEPTION 'Você não pode avaliar seu próprio perfil';
  END IF;

  -- Verificar se o perfil existe
  IF NOT EXISTS (
    SELECT 1 FROM public.entity_profiles 
    WHERE user_id = p_profile_user_id
  ) THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  -- Inserir ou atualizar review (UPSERT)
  INSERT INTO public.profile_reviews (
    profile_user_id, 
    reviewer_id, 
    rating, 
    comment,
    created_at,
    updated_at
  )
  VALUES (
    p_profile_user_id, 
    current_user_id, 
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
  RETURNING * INTO review_result;
  
  -- Retornar resultado estruturado
  RETURN jsonb_build_object(
    'success', true,
    'review', row_to_json(review_result),
    'message', CASE 
      WHEN review_result.created_at = review_result.updated_at 
      THEN 'Avaliação criada com sucesso!' 
      ELSE 'Avaliação atualizada com sucesso!' 
    END
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erro ao salvar avaliação: ' || SQLERRM
    );
END $$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_profile_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_reviews_updated_at
  BEFORE UPDATE ON public.profile_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_reviews_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profile_reviews_profile_user_id ON public.profile_reviews(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_reviews_reviewer_id ON public.profile_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_reviews_created_at ON public.profile_reviews(created_at DESC);