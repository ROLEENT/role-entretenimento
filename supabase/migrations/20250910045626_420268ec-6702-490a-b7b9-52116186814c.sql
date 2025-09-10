-- Correção Crítica de Segurança - Fase 6 (Abordagem In-Place)
-- Corrigir funções existentes adicionando search_path seguro

-- Corrigir função is_admin_session_valid adicionando search_path
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(session_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users au
    JOIN public.approved_admins aa ON au.email = aa.email
    WHERE au.email = session_email 
    AND au.is_active = true 
    AND aa.is_active = true
  );
$$;

-- Corrigir função check_user_is_editor_or_admin
CREATE OR REPLACE FUNCTION public.check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('admin', 'editor')
  );
$$;

-- Corrigir função upsert_artist_review
CREATE OR REPLACE FUNCTION public.upsert_artist_review(
  p_profile_user_id uuid,
  p_rating integer,
  p_comment text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid;
  result_data jsonb;
BEGIN
  -- Verificar autenticação
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating deve estar entre 1 e 5';
  END IF;

  -- Validar ID do perfil
  IF p_profile_user_id IS NULL THEN
    RAISE EXCEPTION 'ID do perfil é obrigatório';
  END IF;

  -- Upsert review
  INSERT INTO public.profile_reviews (
    reviewer_id, 
    profile_user_id, 
    rating, 
    comment, 
    created_at, 
    updated_at
  )
  VALUES (
    current_user_id,
    p_profile_user_id,
    p_rating,
    p_comment,
    NOW(),
    NOW()
  )
  ON CONFLICT (reviewer_id, profile_user_id) 
  DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    updated_at = NOW()
  RETURNING 
    jsonb_build_object(
      'id', id,
      'reviewer_id', reviewer_id,
      'profile_user_id', profile_user_id,
      'rating', rating,
      'comment', comment,
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO result_data;

  RETURN result_data;
END;
$$;

-- Criar tabela de log de segurança se não existir
CREATE TABLE IF NOT EXISTS public.security_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  admin_email text,
  event_data jsonb DEFAULT '{}',
  severity text DEFAULT 'info',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de log de segurança
ALTER TABLE public.security_log ENABLE ROW LEVEL SECURITY;

-- Política para log de segurança - apenas admins podem ver
CREATE POLICY "Admins can view security logs" ON public.security_log
FOR SELECT
USING (
  public.is_admin_session_valid(
    ((current_setting('request.headers', true))::json ->> 'x-admin-email')
  )
);

-- Sistema pode inserir logs
CREATE POLICY "System can insert security logs" ON public.security_log
FOR INSERT
WITH CHECK (true);