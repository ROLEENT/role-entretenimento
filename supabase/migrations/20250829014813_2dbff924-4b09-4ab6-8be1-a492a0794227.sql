-- Adicionar campos de usuário à tabela highlights se não existirem
DO $$ 
BEGIN 
    -- Adicionar created_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'highlights' AND column_name = 'created_by') THEN
        ALTER TABLE public.highlights ADD COLUMN created_by uuid REFERENCES auth.users(id);
    END IF;
    
    -- Adicionar updated_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'highlights' AND column_name = 'updated_by') THEN
        ALTER TABLE public.highlights ADD COLUMN updated_by uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Adicionar novos valores ao enum user_role se não existirem
DO $$ 
BEGIN 
    -- Adicionar 'viewer' se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'viewer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        ALTER TYPE public.user_role ADD VALUE 'viewer';
    END IF;
END $$;

-- Adicionar role à tabela profiles se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'editor';
    END IF;
END $$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Função para verificar se usuário é editor ou admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  );
$$;

-- Função para verificar se usuário pode editar highlight específico
CREATE OR REPLACE FUNCTION public.can_edit_highlight(highlight_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.highlights h ON h.id = highlight_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR 
      (p.role = 'editor' AND (h.created_by = auth.uid() OR h.created_by IS NULL))
    )
  );
$$;

-- Função para verificar se usuário pode publicar
CREATE OR REPLACE FUNCTION public.can_publish_highlight()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  );
$$;

-- Função para verificar se usuário pode deletar
CREATE OR REPLACE FUNCTION public.can_delete_highlight()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Atualizar políticas RLS para highlights
DROP POLICY IF EXISTS "Admin full access to highlights" ON public.highlights;
DROP POLICY IF EXISTS "Editors can insert highlights" ON public.highlights;
DROP POLICY IF EXISTS "Editors can update highlights" ON public.highlights;
DROP POLICY IF EXISTS "Editors can view highlights" ON public.highlights;
DROP POLICY IF EXISTS "Public can view active highlights" ON public.highlights;

-- Política para visualização
CREATE POLICY "Users can view highlights based on role"
ON public.highlights
FOR SELECT
USING (
  -- Público pode ver highlights publicados
  (status = 'published') OR
  -- Usuários autenticados podem ver baseado na role
  (auth.uid() IS NOT NULL AND EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('viewer', 'editor', 'admin') OR
      highlights.created_by = auth.uid()
    )
  ))
);

-- Política para inserção
CREATE POLICY "Editors and admins can create highlights"
ON public.highlights
FOR INSERT
WITH CHECK (
  check_user_is_editor_or_admin()
);

-- Política para atualização
CREATE POLICY "Users can update highlights based on permissions"
ON public.highlights
FOR UPDATE
USING (
  can_edit_highlight(id)
)
WITH CHECK (
  can_edit_highlight(id)
);

-- Política para exclusão (só admins)
CREATE POLICY "Only admins can delete highlights"
ON public.highlights
FOR DELETE
USING (
  check_user_is_admin()
);

-- Trigger para atualizar updated_by automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS highlights_set_updated_by ON public.highlights;
CREATE TRIGGER highlights_set_updated_by
  BEFORE UPDATE ON public.highlights
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_by();