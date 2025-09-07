-- Backup de segurança dos perfis existentes antes da limpeza
INSERT INTO public.system_backups (
  backup_type, 
  table_name, 
  backup_data, 
  record_count, 
  created_by, 
  notes
)
SELECT 
  'pre_cleanup',
  'entity_profiles',
  jsonb_agg(to_jsonb(ep.*)),
  COUNT(*),
  'system',
  'Backup antes da limpeza completa dos perfis órfãos - Plan B'
FROM public.entity_profiles ep;

-- Deletar todos os registros órfãos da tabela entity_profiles
DELETE FROM public.entity_profiles;

-- Inserir log da operação de limpeza
INSERT INTO public.admin_audit_log (
  admin_email,
  table_name,
  record_id,
  action,
  old_values,
  new_values
) VALUES (
  'system@cleanup',
  'entity_profiles',
  gen_random_uuid(),
  'CLEANUP',
  '{"operation": "bulk_delete", "reason": "orphan_profiles_cleanup"}',
  '{"profiles_removed": "all", "backup_created": true}'
);