-- Criar tabela para backups do sistema
CREATE TABLE IF NOT EXISTS public.system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('daily', 'manual', 'pre_restore')),
  table_name TEXT NOT NULL,
  backup_data JSONB NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'system',
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;

-- Policy para admins gerenciarem backups
CREATE POLICY "Admins can manage system backups" ON public.system_backups
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- Função para criar backup de uma tabela
CREATE OR REPLACE FUNCTION public.create_table_backup(
  p_table_name TEXT,
  p_backup_type TEXT DEFAULT 'manual',
  p_created_by TEXT DEFAULT 'system',
  p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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