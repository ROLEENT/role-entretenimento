-- Adicionar política para permitir que usuários autenticados criem artistas
DROP POLICY IF EXISTS "Authenticated users can create artists" ON public.artists;

CREATE POLICY "Authenticated users can create artists" 
ON public.artists 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Manter a política existente de admin para gerenciamento completo
-- mas também permitir que usuários autenticados vejam artistas ativos
DROP POLICY IF EXISTS "Authenticated users can view active artists" ON public.artists;

CREATE POLICY "Authenticated users can view active artists" 
ON public.artists 
FOR SELECT 
TO authenticated
USING (status = 'active');

-- Permitir que usuários autenticados atualizem artistas que criaram
DROP POLICY IF EXISTS "Users can update their own artists" ON public.artists;

CREATE POLICY "Users can update their own artists" 
ON public.artists 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);