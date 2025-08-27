-- Limpar todas as políticas RLS da tabela highlights e criar uma única política de desenvolvimento
DROP POLICY IF EXISTS "Admin can manage highlights" ON public.highlights;
DROP POLICY IF EXISTS "Dev mode - full access to highlights" ON public.highlights;
DROP POLICY IF EXISTS "Public can view published highlights" ON public.highlights;
DROP POLICY IF EXISTS "highlights_admin_delete" ON public.highlights;
DROP POLICY IF EXISTS "highlights_admin_insert" ON public.highlights;
DROP POLICY IF EXISTS "highlights_admin_update" ON public.highlights;
DROP POLICY IF EXISTS "temp_dev_full_access_highlights" ON public.highlights;
DROP POLICY IF EXISTS "temp_dev_read_highlights" ON public.highlights;

-- Criar uma única política que permite todas as operações (para desenvolvimento)
CREATE POLICY "dev_highlights_all_access" ON public.highlights
FOR ALL 
USING (true)
WITH CHECK (true);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'highlights';