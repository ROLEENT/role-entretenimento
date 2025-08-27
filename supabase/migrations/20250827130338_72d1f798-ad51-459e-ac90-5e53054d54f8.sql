-- Verificar as políticas RLS atuais da tabela highlights
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'highlights';

-- Criar políticas RLS apropriadas para a tabela highlights
-- Primeiro, remover as políticas existentes se houver
DROP POLICY IF EXISTS "Anyone can view published highlights" ON public.highlights;
DROP POLICY IF EXISTS "Dev mode - allow all operations" ON public.highlights;

-- Permitir visualização de highlights publicados para todos
CREATE POLICY "Public can view published highlights" ON public.highlights
FOR SELECT 
USING (is_published = true);

-- Permitir todas as operações para modo de desenvolvimento
CREATE POLICY "Dev mode - full access to highlights" ON public.highlights
FOR ALL 
USING (true)
WITH CHECK (true);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'highlights';