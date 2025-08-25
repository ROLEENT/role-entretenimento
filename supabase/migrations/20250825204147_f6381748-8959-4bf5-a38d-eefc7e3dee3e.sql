-- Limpar políticas RLS conflitantes no storage e simplificar autorização

-- Remover políticas RLS antigas do bucket highlights se existirem
DROP POLICY IF EXISTS "Admin can manage highlights storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view highlight images" ON storage.objects;

-- Criar políticas RLS simplificadas e consistentes para o bucket highlights
CREATE POLICY "Admin can manage all highlight images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email')
)
WITH CHECK (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email')
);

CREATE POLICY "Public can view published highlight images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'highlights');

-- Melhorar função de debug para autorização
CREATE OR REPLACE FUNCTION public.debug_admin_highlight_auth(
  p_admin_email text,
  p_highlight_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_valid boolean;
  header_email text;
  highlight_exists boolean;
  result jsonb;
BEGIN
  -- Verificar admin válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  -- Pegar email do header
  header_email := (current_setting('request.headers', true))::json ->> 'x-admin-email';
  
  -- Verificar se highlight existe (se ID fornecido)
  IF p_highlight_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM public.highlights WHERE id = p_highlight_id) INTO highlight_exists;
  END IF;
  
  result := jsonb_build_object(
    'admin_email', p_admin_email,
    'admin_valid', admin_valid,
    'header_email', header_email,
    'header_matches', (header_email = p_admin_email),
    'highlight_id', p_highlight_id,
    'highlight_exists', highlight_exists,
    'current_time', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM,
    'admin_email', p_admin_email,
    'highlight_id', p_highlight_id
  );
END;
$function$;