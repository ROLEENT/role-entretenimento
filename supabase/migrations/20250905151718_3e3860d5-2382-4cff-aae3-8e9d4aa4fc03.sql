-- Simplificar política RLS para desenvolvimento
-- Permitir que qualquer usuário autenticado possa gerenciar eventos

DROP POLICY IF EXISTS "Dev: Authenticated users can manage events" ON public.events;
DROP POLICY IF EXISTS "dev_events_all_access" ON public.events;

-- Política simples para desenvolvimento: usuários autenticados podem tudo
CREATE POLICY "Development: Allow all operations for authenticated users" 
ON public.events 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);