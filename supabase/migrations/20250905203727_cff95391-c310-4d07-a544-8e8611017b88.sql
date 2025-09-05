-- 1. Criar função para sincronizar admin_users com approved_admins
CREATE OR REPLACE FUNCTION public.sync_admin_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir admins aprovados que não existem em admin_users
  INSERT INTO public.admin_users (email, full_name, is_active, created_at, updated_at, password_hash)
  SELECT 
    aa.email,
    COALESCE(aa.email, 'Admin'),
    aa.is_active,
    aa.created_at,
    NOW(),
    'placeholder_hash'
  FROM public.approved_admins aa
  WHERE aa.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.email = aa.email
  );
  
  -- Atualizar status de admin_users baseado em approved_admins
  UPDATE public.admin_users 
  SET is_active = false
  WHERE email NOT IN (
    SELECT email FROM public.approved_admins WHERE is_active = true
  );
  
  UPDATE public.admin_users 
  SET is_active = true
  WHERE email IN (
    SELECT email FROM public.approved_admins WHERE is_active = true
  );
END;
$$;

-- 2. Executar sincronização
SELECT public.sync_admin_users();

-- 3. Atualizar função is_admin_session_valid para usar approved_admins como fonte primária
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = session_email AND is_active = true
  )
$$;

-- 4. Atualizar função soft_delete_event para usar approved_admins
CREATE OR REPLACE FUNCTION public.soft_delete_event(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Obter email do admin dos headers
  admin_email := (current_setting('request.headers', true))::json ->> 'x-admin-email';
  
  -- Verificar se é admin válido
  IF NOT EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', admin_email;
  END IF;

  -- Fazer soft delete do evento
  UPDATE public.events
  SET deleted_at = NOW(), status = 'draft', updated_at = NOW()
  WHERE id = p_event_id AND deleted_at IS NULL;
  
  -- Log da operação
  PERFORM public.log_security_event(
    'event_soft_delete',
    NULL,
    admin_email,
    jsonb_build_object('event_id', p_event_id),
    'info'
  );
END;
$$;

-- 5. Criar função para deletar evento via admin com validação completa
CREATE OR REPLACE FUNCTION public.admin_delete_event(p_admin_email text, p_event_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se é admin válido
  IF NOT EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = p_admin_email AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: admin não encontrado ou inativo (email: %)', p_admin_email;
  END IF;

  -- Verificar se evento existe
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Evento não encontrado';
  END IF;

  -- Fazer soft delete
  UPDATE public.events
  SET deleted_at = NOW(), status = 'draft', updated_at = NOW()
  WHERE id = p_event_id AND deleted_at IS NULL;

  -- Log da operação
  PERFORM public.log_security_event(
    'admin_event_delete',
    NULL,
    p_admin_email,
    jsonb_build_object('event_id', p_event_id),
    'info'
  );

  RETURN true;
END;
$$;

-- 6. Atualizar políticas RLS para usar approved_admins consistentemente
DROP POLICY IF EXISTS "Admin can manage all agenda items" ON public.agenda_itens;
CREATE POLICY "Admin can manage all agenda items"
ON public.agenda_itens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.approved_admins
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.approved_admins
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);