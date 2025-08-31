-- Corrigir política RLS para o bucket venues para usar admin_users table diretamente
-- como funciona no bucket blog-posts

-- Primeiro, remover a política atual
DROP POLICY IF EXISTS "Admin can manage venue files" ON storage.objects;

-- Criar nova política para venues que usa admin_users table diretamente
CREATE POLICY "Admin can manage venue files" ON storage.objects
FOR ALL 
USING (
  bucket_id = 'venues' AND (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
    OR auth.uid() IS NOT NULL  -- Fallback para usuários autenticados
  )
)
WITH CHECK (
  bucket_id = 'venues' AND (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
    OR auth.uid() IS NOT NULL  -- Fallback para usuários autenticados
  )
);