-- Criar função para validar admin via admin_users usando email da sessão
CREATE OR REPLACE FUNCTION public.is_admin_via_admin_users()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_email text;
BEGIN
  -- Tentar obter email do contexto da requisição (será passado pelo frontend)
  session_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  -- Se não encontrou no header, retorna false
  IF session_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se admin existe e está ativo
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
END;
$$;

-- Atualizar políticas RLS do bucket highlights para aceitar admin_users
DROP POLICY IF EXISTS "Admin can upload highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete highlight images" ON storage.objects;

-- Política para upload (INSERT)
CREATE POLICY "Admin can upload highlight images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'highlights' AND (
    -- Verificar via approved_admins (sistema antigo)
    EXISTS (
      SELECT 1 FROM public.approved_admins 
      WHERE email = auth.email() AND is_active = true
    )
    OR
    -- Verificar via admin_users (sistema atual)
    public.is_admin_via_admin_users()
  )
);

-- Política para visualização (SELECT)
CREATE POLICY "Admin can view highlight images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'highlights' AND (
    -- Verificar via approved_admins (sistema antigo)
    EXISTS (
      SELECT 1 FROM public.approved_admins 
      WHERE email = auth.email() AND is_active = true
    )
    OR
    -- Verificar via admin_users (sistema atual)
    public.is_admin_via_admin_users()
  )
);

-- Política para atualização (UPDATE)
CREATE POLICY "Admin can update highlight images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'highlights' AND (
    -- Verificar via approved_admins (sistema antigo)
    EXISTS (
      SELECT 1 FROM public.approved_admins 
      WHERE email = auth.email() AND is_active = true
    )
    OR
    -- Verificar via admin_users (sistema atual)
    public.is_admin_via_admin_users()
  )
);

-- Política para exclusão (DELETE)
CREATE POLICY "Admin can delete highlight images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'highlights' AND (
    -- Verificar via approved_admins (sistema antigo)
    EXISTS (
      SELECT 1 FROM public.approved_admins 
      WHERE email = auth.email() AND is_active = true
    )
    OR
    -- Verificar via admin_users (sistema atual)
    public.is_admin_via_admin_users()
  )
);