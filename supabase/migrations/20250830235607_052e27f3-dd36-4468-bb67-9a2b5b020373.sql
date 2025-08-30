-- Adicionar políticas RLS para tabela cities para permitir acesso admin
CREATE POLICY IF NOT EXISTS "Admins can access cities" 
ON public.cities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  ) OR true -- Permitir acesso público também
);