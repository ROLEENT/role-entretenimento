-- Corrigir políticas RLS para admin_users para resolver erro 406
-- Atualmente, a política está muito restritiva, vamos criar uma nova política mais simples

-- Primeiro, vamos remover as políticas existentes que podem estar causando o problema
DROP POLICY IF EXISTS "Admin users can update own profile securely" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users restricted access" ON public.admin_users;

-- Criar nova política simplificada para permitir leitura dos admin_users
CREATE POLICY "Allow admin users to view their profile" ON public.admin_users
  FOR SELECT
  USING (
    email = current_setting('request.headers', true)::json->>'x-admin-email'
    OR 
    EXISTS (
      SELECT 1 FROM public.approved_admins 
      WHERE approved_admins.email = admin_users.email 
      AND approved_admins.is_active = true
    )
  );

-- Política para permitir updates do próprio perfil
CREATE POLICY "Allow admin users to update their profile" ON public.admin_users
  FOR UPDATE
  USING (
    email = current_setting('request.headers', true)::json->>'x-admin-email'
    AND is_active = true
  );

-- Garantir que a tabela tem RLS habilitada
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;