-- Primeiro, remover todas as políticas RLS conflitantes da tabela artists
DROP POLICY IF EXISTS "Admin full access to artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can manage all artists" ON public.artists;
DROP POLICY IF EXISTS "Editors can insert artists" ON public.artists;
DROP POLICY IF EXISTS "Editors can update artists" ON public.artists;
DROP POLICY IF EXISTS "Editors can view artists" ON public.artists;
DROP POLICY IF EXISTS "Public can view basic artist info" ON public.artists;
DROP POLICY IF EXISTS "artists_admin_all" ON public.artists;
DROP POLICY IF EXISTS "artists_public_read" ON public.artists;

-- Criar políticas RLS simplificadas e funcionais
CREATE POLICY "Public can view active artists" 
ON public.artists 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage artists" 
ON public.artists 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- Verificar se o trigger de sincronização está ativo
SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'public.artists'::regclass;