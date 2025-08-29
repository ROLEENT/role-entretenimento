-- Corrigir políticas RLS da tabela profiles para suporte adequado ao Admin v2
-- Remover políticas existentes e recriar com lógica correta

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Política para SELECT: usuário autenticado pode ver a própria linha
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT: usuário pode inserir a própria linha se id = auth.uid()
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuário pode atualizar a própria linha, admin pode atualizar qualquer linha
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Função para provisionar profile automaticamente se não existir
CREATE OR REPLACE FUNCTION public.provision_user_profile(p_user_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_profile jsonb;
  new_profile jsonb;
BEGIN
  -- Verificar se profile já existe
  SELECT to_jsonb(p.*) INTO existing_profile
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  -- Se já existe, retornar o existente
  IF existing_profile IS NOT NULL THEN
    RETURN existing_profile;
  END IF;
  
  -- Criar novo profile com role='viewer'
  INSERT INTO public.profiles (
    user_id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_email,
    'viewer',
    now(),
    now()
  ) RETURNING to_jsonb(profiles.*) INTO new_profile;
  
  RETURN new_profile;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, tentar buscar novamente (pode ter sido criado por outro processo)
  SELECT to_jsonb(p.*) INTO existing_profile
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  RETURN existing_profile;
END;
$$;