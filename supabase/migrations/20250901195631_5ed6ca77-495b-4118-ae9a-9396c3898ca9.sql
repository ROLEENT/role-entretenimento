-- ETAPA 2: Parte 2 - Melhorar RLS e Sistema de Seguir
-- Corriger políticas RLS dos profiles e sistema social

-- 1. Atualizar RLS policies da tabela profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view public profiles and own profile"
ON public.profiles FOR SELECT
USING (
  NOT is_private OR 
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = auth.uid() 
    AND following_id = profiles.user_id
  )
);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 2. Melhorar sistema de follows (verificar estrutura)
-- Verificar se tabela follows tem estrutura correta
DO $$
BEGIN
  -- Adicionar colunas se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'follows' AND column_name = 'follower_id') THEN
    ALTER TABLE public.follows ADD COLUMN follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'follows' AND column_name = 'following_id') THEN
    ALTER TABLE public.follows ADD COLUMN following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Criar função para atualizar contadores de follow
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar following_count do seguidor
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Incrementar followers_count do seguido
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar following_count do seguidor
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    
    -- Decrementar followers_count do seguido
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;