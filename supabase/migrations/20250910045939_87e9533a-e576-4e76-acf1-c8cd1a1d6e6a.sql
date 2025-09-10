-- Correção de Segurança - Configurações e RLS
-- Focar em correções que não alteram assinaturas de funções

-- Implementar RLS restritiva em tabelas sensíveis que não possuem
-- Verificar se tabela user_profiles existe, se não, criar
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS em user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para user_profiles - usuários podem ver próprio perfil, admins veem todos
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para usuários atualizarem próprio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verificar se tabela profile_reviews existe e tem RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_reviews') THEN
    -- Habilitar RLS se não estiver habilitado
    ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas se não existirem
    -- Usuários podem ver reviews dos perfis públicos
    DROP POLICY IF EXISTS "Public can view profile reviews" ON public.profile_reviews;
    CREATE POLICY "Public can view profile reviews" ON public.profile_reviews
    FOR SELECT
    USING (true);
    
    -- Usuários autenticados podem criar reviews
    DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.profile_reviews;
    CREATE POLICY "Authenticated users can create reviews" ON public.profile_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);
    
    -- Usuários podem atualizar suas próprias reviews
    DROP POLICY IF EXISTS "Users can update own reviews" ON public.profile_reviews;
    CREATE POLICY "Users can update own reviews" ON public.profile_reviews
    FOR UPDATE
    USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END
$$;

-- Implementar auditoria básica em tabelas críticas
-- Criar trigger de auditoria para mudanças em admin_users
CREATE OR REPLACE FUNCTION public.audit_admin_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log mudanças em admin_users
  PERFORM log_security_event(
    'admin_' || lower(TG_OP),
    NULL,
    COALESCE(NEW.email, OLD.email),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'old_values', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE NULL END
    ),
    'critical'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Criar trigger para admin_users se não existir
DROP TRIGGER IF EXISTS audit_admin_changes_trigger ON public.admin_users;
CREATE TRIGGER audit_admin_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();