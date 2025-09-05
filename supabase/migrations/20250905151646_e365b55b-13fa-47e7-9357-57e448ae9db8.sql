-- Criar política temporária mais permissiva para desenvolvimento
-- Isso permitirá exclusão de eventos para usuários autenticados

-- Primeiro, vamos desabilitar temporariamente a política restritiva
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;

-- Criar política mais permissiva para desenvolvimento
CREATE POLICY "Dev: Authenticated users can manage events" 
ON public.events 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Inserir um admin de desenvolvimento na tabela profiles se não existir
INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@dev.com',
  'admin',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  updated_at = now();