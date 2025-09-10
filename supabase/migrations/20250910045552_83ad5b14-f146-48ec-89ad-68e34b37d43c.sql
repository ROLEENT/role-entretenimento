-- Correção Crítica de Segurança - Fase 6 (Correção Segura)
-- Atualizar funções existentes com search_path seguro

-- Atualizar função log_security_event com search_path
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT NULL,
  admin_email text DEFAULT NULL,
  event_data jsonb DEFAULT '{}',
  severity text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.security_log (
    event_type,
    user_id,
    admin_email,
    event_data,
    severity,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    event_type,
    COALESCE(user_id, auth.uid()),
    admin_email,
    event_data,
    severity,
    inet_client_addr(),
    COALESCE((current_setting('request.headers', true))::json ->> 'user-agent', 'unknown'),
    NOW()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Atualizar função de criação de atividade com search_path
CREATE OR REPLACE FUNCTION public.create_activity(p_user_id uuid, p_actor_id uuid, p_type text, p_object_type text, p_object_id uuid, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.activity_feed (
    user_id,
    actor_id,
    type,
    object_type,
    object_id,
    data
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_type,
    p_object_type,
    p_object_id,
    p_data
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Atualizar função de backup com search_path
CREATE OR REPLACE FUNCTION public.create_table_backup(p_table_name text, p_backup_type text DEFAULT 'manual'::text, p_created_by text DEFAULT 'system'::text, p_notes text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  backup_id UUID;
  backup_data JSONB;
  record_count INTEGER;
BEGIN
  -- Get all data from the specified table
  EXECUTE format('SELECT jsonb_agg(to_jsonb(t.*)) FROM %I t', p_table_name) INTO backup_data;
  
  -- Count records
  EXECUTE format('SELECT COUNT(*) FROM %I', p_table_name) INTO record_count;
  
  -- Insert backup record
  INSERT INTO public.system_backups (
    backup_type, table_name, backup_data, record_count, created_by, notes
  ) VALUES (
    p_backup_type, p_table_name, COALESCE(backup_data, '[]'::jsonb), record_count, p_created_by, p_notes
  ) RETURNING id INTO backup_id;
  
  RETURN backup_id;
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

-- Habilitar RLS na tabela de log de segurança se ainda não estiver habilitada
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'security_log'
  ) THEN
    ALTER TABLE public.security_log ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;