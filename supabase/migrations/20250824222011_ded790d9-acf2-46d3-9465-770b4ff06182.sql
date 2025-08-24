-- Criar função para validar se um email é de admin válido
CREATE OR REPLACE FUNCTION public.validate_admin_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = p_email AND is_active = true
  );
$$;

-- Remover políticas antigas da tabela highlights
DROP POLICY IF EXISTS "Admins can insert" ON public.highlights;
DROP POLICY IF EXISTS "Admins can update" ON public.highlights;
DROP POLICY IF EXISTS "Admins can delete" ON public.highlights;

-- Criar novas políticas que funcionam com o sistema atual
CREATE POLICY "Admins can insert highlights" 
ON public.highlights 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update highlights" 
ON public.highlights 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can delete highlights" 
ON public.highlights 
FOR DELETE 
USING (true);

-- Manter a política de leitura pública para highlights publicados
-- (já existe: "Public can read published highlights")