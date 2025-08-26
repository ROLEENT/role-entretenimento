-- Política temporária para permitir leitura de destaques sem autenticação (modo desenvolvimento)
CREATE POLICY "temp_dev_read_highlights" 
ON public.highlights 
FOR SELECT 
USING (true);

-- Política temporária para permitir todas as operações sem autenticação (modo desenvolvimento)
-- IMPORTANTE: REMOVER EM PRODUÇÃO!
CREATE POLICY "temp_dev_full_access_highlights" 
ON public.highlights 
FOR ALL
USING (true)
WITH CHECK (true);