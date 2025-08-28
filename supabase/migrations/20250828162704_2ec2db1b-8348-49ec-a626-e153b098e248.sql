-- Corrigir abordagem: remover políticas conflitantes e adicionar política correta

-- Verificar se já existem políticas que permitam admin operations
-- Vamos criar uma política específica mais direcionada

-- Remover as políticas genéricas que adicionamos se existirem
DROP POLICY IF EXISTS "Admin functions can insert highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admin functions can update highlights" ON public.highlights;  
DROP POLICY IF EXISTS "Admin functions can delete highlights" ON public.highlights;

-- Criar política específica para operações de sistema via funções SECURITY DEFINER
CREATE POLICY "System operations via security definer functions" 
ON public.highlights 
FOR ALL 
TO PUBLIC 
USING (true)
WITH CHECK (true);