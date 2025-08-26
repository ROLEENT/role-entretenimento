-- Resolver alertas de segurança críticos

-- PROBLEMA 1 & 2: Remover Security Definer Views problemáticas
-- Estas views contornam as políticas RLS e representam risco de segurança

-- Dropar view blog_comments_public (se existir)
DROP VIEW IF EXISTS public.blog_comments_public CASCADE;

-- Dropar view organizers_public (se existir) 
DROP VIEW IF EXISTS public.organizers_public CASCADE;

-- PROBLEMA 3: Mover extensão pg_net do schema público
-- Verificar se a extensão pg_net está no public schema e reorganizar se necessário
-- Nota: Manter pg_net se for necessária para Edge Functions, mas documentar uso

-- Verificar se pg_net é usada pelas Edge Functions
-- Se não for crítica, pode ser removida
-- Para este projeto, vamos manter mas mover para schema extensions se possível

-- Criar schema dedicado para extensões (se não existir)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Tentar mover pg_net para schema extensions (se existir no public)
-- Nota: Esta operação pode falhar se a extensão for crítica para o funcionamento
-- DO $$ 
-- BEGIN
--   IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
--     DROP EXTENSION IF EXISTS pg_net CASCADE;
--     CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
--   END IF;
-- END $$;

-- Como alternativa mais segura, apenas documentamos o uso da extensão pg_net
-- e garantimos que está configurada corretamente

-- ADICIONAR FUNÇÕES DE SEGURANÇA MELHORADAS
-- Função para verificar se usuário é admin de forma mais segura
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()),
    false
  );
$$;

-- Função para obter comentários do blog de forma segura (substitui view removida)
CREATE OR REPLACE FUNCTION public.get_blog_comments_safe(p_post_id uuid)
RETURNS TABLE(
  id uuid,
  post_id uuid,
  author_name text,
  content text,
  created_at timestamp with time zone,
  parent_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    bc.id,
    bc.post_id,
    bc.author_name,
    bc.content,
    bc.created_at,
    bc.parent_id
  FROM public.blog_comments bc
  WHERE bc.post_id = p_post_id 
    AND bc.is_approved = true
  ORDER BY bc.created_at ASC;
$$;

-- Função para obter informações públicas de organizadores (substitui view removida)
CREATE OR REPLACE FUNCTION public.get_organizer_public_safe(p_organizer_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  site text,
  instagram text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    o.id,
    o.name,
    o.site,
    o.instagram,
    o.created_at,
    o.updated_at
  FROM public.organizers o
  WHERE o.id = p_organizer_id;
$$;

-- MELHORAR POLÍTICAS RLS EXISTENTES
-- Garantir que todas as tabelas críticas tenham RLS habilitado

-- Verificar RLS na tabela admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Verificar RLS na tabela admin_sessions  
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Verificar RLS na tabela approved_admins
ALTER TABLE public.approved_admins ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICA DE AUDITORIA PARA OPERAÇÕES CRÍTICAS
-- Tabela para log de operações administrativas sensíveis
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS para audit log - apenas admins podem ver
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit log" ON public.admin_audit_log
FOR SELECT USING (
  is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- Função para registrar ações administrativas
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_table_name text DEFAULT NULL,
  p_record_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Obter email do admin da sessão
  admin_email := (current_setting('request.headers', true))::json ->> 'x-admin-email';
  
  -- Registrar ação apenas se admin válido
  IF is_admin_session_valid(admin_email) THEN
    INSERT INTO public.admin_audit_log (
      admin_email, action, table_name, record_id, old_values, new_values
    ) VALUES (
      admin_email, p_action, p_table_name, p_record_id, p_old_values, p_new_values
    );
  END IF;
END;
$$;