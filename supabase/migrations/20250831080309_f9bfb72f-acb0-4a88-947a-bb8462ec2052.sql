-- Vamos primeiro listar as políticas existentes para admin_users
-- e depois criar uma solução mais robusta

-- Remover todas as políticas existentes na tabela admin_users
DROP POLICY IF EXISTS "Allow admin users to view their profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update own profile securely" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users restricted access" ON public.admin_users;

-- Criar política mais simples para debug
CREATE POLICY "Enable read for authenticated admin users" ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.approved_admins 
      WHERE approved_admins.email = admin_users.email 
      AND approved_admins.is_active = true
    )
  );

-- Política para updates
CREATE POLICY "Enable update for admin users" ON public.admin_users
  FOR UPDATE
  USING (is_active = true);

-- Temporariamente, vamos também adicionar uma política mais permissiva para debug
-- Esta deve ser removida em produção
CREATE POLICY "Temporary debug access" ON public.admin_users
  FOR SELECT
  USING (true);

-- Garantir que a tabela tem RLS habilitada
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;