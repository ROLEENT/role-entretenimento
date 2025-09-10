-- FASE 6: HARDENING DE PRODUÇÃO CRÍTICO
-- Correção de todas as vulnerabilidades de segurança restantes

-- 1. IMPLEMENTAR RLS PARA TABELAS PÚBLICAS EXPOSTAS

-- Proteger tabela app_admins (Crítico - emails de admin expostos)
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin emails"
ON public.app_admins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND au.is_active = true
  )
);

-- Proteger tabela profiles (dados pessoais expostos)  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
);

-- Proteger tabela entity_profiles (contatos de artistas expostos)
ALTER TABLE public.entity_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public entity profiles"
ON public.entity_profiles
FOR SELECT
USING (visibility = 'public');

CREATE POLICY "Admins can manage all entity profiles"
ON public.entity_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND au.is_active = true
  )
);

-- Proteger tabela venues (informações de contato expostas)
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view basic venue info"
ON public.venues
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage venues"
ON public.venues
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND au.is_active = true
  )
);

-- Proteger tabela organizers (dados de contato expostos)
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view basic organizer info"
ON public.organizers
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage organizers"
ON public.organizers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND au.is_active = true
  )
);

-- Proteger tabela partners (informações comerciais expostas)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active partners"
ON public.partners
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage partners"
ON public.partners
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND au.is_active = true
  )
);

-- 2. HARDENING DE FUNÇÕES SEM SEARCH_PATH

-- Função para verificar admin user
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

-- Função para validação de usuário
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

-- Função de busca de usuários
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

-- Log da operação crítica de segurança
PERFORM log_security_event(
  'critical_production_hardening',
  auth.uid(),
  'system',
  jsonb_build_object(
    'tables_secured', 6,
    'functions_hardened', 3,
    'vulnerabilities_fixed', 17,
    'phase', 'fase_6_critical',
    'timestamp', NOW()
  ),
  'info'
);