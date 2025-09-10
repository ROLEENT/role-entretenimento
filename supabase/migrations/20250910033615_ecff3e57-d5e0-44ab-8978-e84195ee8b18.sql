-- ETAPA 1: Correção Imediata de Segurança - Parte 3

-- Remover funções existentes que estão causando conflito
DROP FUNCTION IF EXISTS public.validate_admin_email(text) CASCADE;

-- Recriar função para validar email de admin de forma segura
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = email_to_check AND is_active = true
  )
$$;

-- Limpar políticas RLS conflitantes em agenda_itens
DROP POLICY IF EXISTS "agenda_public_read" ON public.agenda_itens;
DROP POLICY IF EXISTS "agenda_read_published" ON public.agenda_itens;
DROP POLICY IF EXISTS "agenda_staff_read" ON public.agenda_itens;
DROP POLICY IF EXISTS "agenda_staff_insert" ON public.agenda_itens;
DROP POLICY IF EXISTS "agenda_staff_update" ON public.agenda_itens;
DROP POLICY IF EXISTS "agenda_staff_delete" ON public.agenda_itens;
DROP POLICY IF EXISTS "Admin can manage all agenda items" ON public.agenda_itens;

-- Recriar políticas RLS unificadas e simplificadas
CREATE POLICY "agenda_public_access" ON public.agenda_itens
FOR SELECT USING (
  (status = 'published'::agenda_status AND deleted_at IS NULL) OR
  (EXISTS (SELECT 1 FROM public.approved_admins WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true))
);

CREATE POLICY "agenda_admin_manage" ON public.agenda_itens
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.approved_admins WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.approved_admins WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') AND is_active = true)
);

-- Criar função de auditoria administrativa melhorada
CREATE OR REPLACE FUNCTION public.audit_admin_action(
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
BEGIN
  admin_email := (current_setting('request.headers', true))::json ->> 'x-admin-email';
  
  IF admin_email IS NOT NULL AND validate_admin_email(admin_email) THEN
    INSERT INTO public.admin_audit_log (
      admin_email,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      ip_address,
      user_agent
    ) VALUES (
      admin_email,
      p_action,
      p_table_name,
      p_record_id,
      p_old_values,
      p_new_values,
      inet_client_addr(),
      COALESCE((current_setting('request.headers', true))::json ->> 'user-agent', 'unknown')
    );
  END IF;
END;
$$;