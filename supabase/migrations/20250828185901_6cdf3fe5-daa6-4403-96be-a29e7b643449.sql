-- ETAPA 1: CORREÇÃO FINAL DAS POLICIES HIGHLIGHTS
-- Corrigir policies para highlights com coluna correta
DROP POLICY IF EXISTS "highlights_select_published" ON public.highlights;

CREATE POLICY "highlights_select_published" 
  ON public.highlights FOR SELECT 
  USING (is_published = true);

-- Função para auditoria de ações admin
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  table_name text,
  record_id uuid,
  old_data jsonb DEFAULT NULL,
  new_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  )
  VALUES (
    auth.email(),
    action_type,
    table_name,
    record_id,
    old_data,
    new_data
  );
EXCEPTION WHEN OTHERS THEN
  -- Silenciar erros de auditoria para não afetar operações principais
  NULL;
END;
$$;