-- Adicionar políticas RLS para tabela cities para permitir acesso admin
DROP POLICY IF EXISTS "Admins can access cities" ON public.cities;

CREATE POLICY "Admins can access cities" 
ON public.cities 
FOR SELECT 
USING (true); -- Permitir acesso público para cities pois são dados públicos