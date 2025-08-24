-- Corrigir erros de RLS para as tabelas que faltaram
-- Ativar RLS para admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Ativar RLS para approved_admins  
ALTER TABLE public.approved_admins ENABLE ROW LEVEL SECURITY;

-- Política para admin_users (apenas admins autenticados podem acessar)
CREATE POLICY "Authenticated admins can manage admin_users" 
ON public.admin_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = (
      SELECT email FROM public.profiles 
      WHERE user_id = auth.uid()
    ) AND is_active = true
  )
);

-- Política para approved_admins (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage approved_admins" 
ON public.approved_admins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = (
      SELECT email FROM public.profiles 
      WHERE user_id = auth.uid()
    ) AND is_active = true
  )
);