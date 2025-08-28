-- Adicionar fiih@roleentretenimento.com como admin aprovado e na tabela admin_users
INSERT INTO public.approved_admins (email, approved_by, is_active)
VALUES ('fiih@roleentretenimento.com', 'system', true)
ON CONFLICT (email) DO UPDATE SET 
  is_active = true,
  approved_by = 'system';

-- Adicionar fiih@roleentretenimento.com na tabela admin_users
INSERT INTO public.admin_users (email, full_name, password_hash, is_active)
VALUES ('fiih@roleentretenimento.com', 'Admin Role', 'temp_hash_123', true)
ON CONFLICT (email) DO UPDATE SET 
  is_active = true,
  full_name = 'Admin Role';