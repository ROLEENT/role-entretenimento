-- FASE 6: HARDENING DE PRODUÇÃO CRÍTICO - CORREÇÃO ESPECÍFICA
-- Aplicar apenas as políticas que não existem

-- 1. PROTEGER TABELA APP_ADMINS (CRÍTICO - emails de admin expostos)
DO $$
BEGIN
  -- Habilitar RLS se ainda não estiver
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'app_admins' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Criar política apenas se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'app_admins' 
    AND policyname = 'Only admins can view admin emails'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can view admin emails"
    ON public.app_admins
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users au
        WHERE au.email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'')
        AND au.is_active = true
      )
    )';
  END IF;
END $$;

-- 2. PROTEGER TABELA PROFILES (dados pessoais expostos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.user_id = auth.uid() 
        AND up.role = ''admin''
      )
    )';
  END IF;
END $$;

-- 3. PROTEGER TABELA ENTITY_PROFILES (contatos de artistas expostos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'entity_profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.entity_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entity_profiles' 
    AND policyname = 'Public can view public entity profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view public entity profiles"
    ON public.entity_profiles
    FOR SELECT
    USING (visibility = ''public'')';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entity_profiles' 
    AND policyname = 'Admins can manage all entity profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage all entity profiles"
    ON public.entity_profiles
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users au
        WHERE au.email = ((current_setting(''request.headers'', true))::json ->> ''x-admin-email'')
        AND au.is_active = true
      )
    )';
  END IF;
END $$;

-- 4. HARDENING DE FUNÇÕES SEM SEARCH_PATH
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT 'admin' WHERE EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )),
    'user'
  );
$$;

CREATE OR REPLACE FUNCTION public.validate_username(new_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE username = new_username
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.search_users_by_username(search_term text)
RETURNS TABLE(
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  followers_count integer,
  is_verified boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    up.user_id,
    up.username,
    up.display_name,
    up.avatar_url,
    COALESCE(fc.count, 0)::integer as followers_count,
    COALESCE(up.is_verified, false) as is_verified
  FROM public.user_profiles up
  LEFT JOIN (
    SELECT following_id, COUNT(*) as count 
    FROM public.follows 
    GROUP BY following_id
  ) fc ON fc.following_id = up.user_id
  WHERE up.username ILIKE '%' || search_term || '%'
  AND up.visibility = 'public'
  ORDER BY COALESCE(fc.count, 0) DESC
  LIMIT 20;
$$;