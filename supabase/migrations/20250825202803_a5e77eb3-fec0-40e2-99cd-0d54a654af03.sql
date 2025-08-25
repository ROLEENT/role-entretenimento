-- Corrigir problemas de RLS e policies para highlights - VERSÃO CORRIGIDA

-- 1. REMOVER TODAS AS POLICIES EXISTENTES PRIMEIRO
DROP POLICY IF EXISTS "Admins can delete highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins can insert highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins can update highlights" ON public.highlights;
DROP POLICY IF EXISTS "Admins podem gerenciar highlights - insert" ON public.highlights;
DROP POLICY IF EXISTS "Admins podem gerenciar highlights - update" ON public.highlights;
DROP POLICY IF EXISTS "Admins podem gerenciar highlights - delete" ON public.highlights;

-- 2. CRIAR POLICIES CORRETAS BASEADAS NA VALIDAÇÃO DE ADMIN
CREATE POLICY "highlights_admin_insert" ON public.highlights 
FOR INSERT WITH CHECK (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "highlights_admin_update" ON public.highlights 
FOR UPDATE USING (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
) WITH CHECK (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "highlights_admin_delete" ON public.highlights 
FOR DELETE USING (
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

-- 3. CORRIGIR BUCKET HIGHLIGHTS E SUAS POLICIES
-- Garantir que o bucket highlights existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('highlights', 'highlights', true) 
ON CONFLICT (id) DO NOTHING;

-- Remover policies antigas do bucket highlights
DROP POLICY IF EXISTS "Public can view highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Qualquer um pode ver imagens de highlights" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem fazer upload de imagens de highlights" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar imagens de highlights" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar imagens de highlights" ON storage.objects;

-- Criar policies corretas para o bucket highlights
CREATE POLICY "highlights_storage_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'highlights');

CREATE POLICY "highlights_storage_insert" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "highlights_storage_update" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
) WITH CHECK (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

CREATE POLICY "highlights_storage_delete" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'highlights' AND 
  is_admin_session_valid((current_setting('request.headers', true))::json->>'x-admin-email')
);

-- 4. FUNÇÃO DE DEBUG PARA TESTAR PERMISSÕES
CREATE OR REPLACE FUNCTION public.debug_admin_highlights(p_admin_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  admin_valid boolean;
  highlights_count integer;
  result jsonb;
BEGIN
  -- Verificar se admin é válido
  SELECT is_admin_session_valid(p_admin_email) INTO admin_valid;
  
  -- Tentar contar highlights
  SELECT COUNT(*) FROM public.highlights INTO highlights_count;
  
  result := jsonb_build_object(
    'admin_email', p_admin_email,
    'admin_valid', admin_valid,
    'highlights_count', highlights_count,
    'header_email', (current_setting('request.headers', true))::json->>'x-admin-email',
    'test_timestamp', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM,
    'admin_email', p_admin_email,
    'error_detail', SQLSTATE
  );
END;
$$;