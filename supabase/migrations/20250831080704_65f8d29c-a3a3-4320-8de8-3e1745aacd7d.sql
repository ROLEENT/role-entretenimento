-- Remover a política temporária de debug que criamos
DROP POLICY IF EXISTS "Temporary debug access" ON public.admin_users;

-- Manter apenas as políticas necessárias para admin_users
-- A política "Enable read for authenticated admin users" já permite acesso correto