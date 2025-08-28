-- Adicionar fidorneles@gmail.com como admin aprovado
INSERT INTO public.approved_admins (email, approved_by, is_active)
VALUES ('fidorneles@gmail.com', 'system', true)
ON CONFLICT (email) DO UPDATE SET 
  is_active = true,
  approved_by = 'system';

-- Adicionar fidorneles@gmail.com na tabela admin_users
INSERT INTO public.admin_users (email, full_name, password_hash, is_active)
VALUES ('fidorneles@gmail.com', 'Fido Ornelas', 'temp_hash_123', true)
ON CONFLICT (email) DO UPDATE SET 
  is_active = true,
  full_name = 'Fido Ornelas';