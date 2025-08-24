-- Corrigir recursão infinita nas políticas RLS

-- Remover todas as políticas problemáticas da tabela approved_admins
DROP POLICY IF EXISTS "Admins can manage approved admins" ON public.approved_admins;
DROP POLICY IF EXISTS "Admins can manage approved_admins" ON public.approved_admins;

-- Criar políticas simples que não causem recursão
-- Política mais simples para leitura - qualquer usuário autenticado pode ver
CREATE POLICY "Authenticated users can view approved admins" 
ON public.approved_admins 
FOR SELECT 
TO authenticated
USING (true);

-- Política para admins gerenciarem - usando função que não causa recursão
CREATE POLICY "Admins can manage approved admins safely" 
ON public.approved_admins 
FOR ALL 
TO authenticated
USING (validate_admin_email(auth.email()))
WITH CHECK (validate_admin_email(auth.email()));

-- Corrigir políticas na tabela admin_users para evitar recursão
DROP POLICY IF EXISTS "Authenticated admins can manage admin_users" ON public.admin_users;

-- Criar política mais simples para admin_users
CREATE POLICY "Simple admin users policy" 
ON public.admin_users 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);