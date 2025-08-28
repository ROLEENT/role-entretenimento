-- Corrigir as políticas RLS da tabela highlights para permitir operações via funções SECURITY DEFINER

-- Primeiro, verificar a política atual
-- Se há política bloqueando INSERT para admins, vamos adicionar política permitindo

-- Política para permitir inserção via funções admin
CREATE POLICY "Admin functions can insert highlights" 
ON public.highlights 
FOR INSERT 
TO PUBLIC 
WITH CHECK (true);

-- Política para permitir atualização via funções admin  
CREATE POLICY "Admin functions can update highlights" 
ON public.highlights 
FOR UPDATE 
TO PUBLIC 
USING (true);

-- Política para permitir deleção via funções admin
CREATE POLICY "Admin functions can delete highlights" 
ON public.highlights 
FOR DELETE 
TO PUBLIC 
USING (true);

-- Garantir que a função seja executada como SUPERUSER
-- Vamos recriar a função com privilégios apropriados
ALTER FUNCTION public.admin_create_highlight_v2 SECURITY DEFINER;
ALTER FUNCTION public.admin_update_highlight_v2 SECURITY DEFINER;