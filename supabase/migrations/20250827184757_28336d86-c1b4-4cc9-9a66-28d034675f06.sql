-- Adicionar guilherme@roleentretenimento.com como admin aprovado
INSERT INTO public.approved_admins (email, approved_by, is_active)
VALUES ('guilherme@roleentretenimento.com', 'system', true)
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  approved_by = 'system';

-- Criar usuário administrativo para guilherme@roleentretenimento.com
INSERT INTO public.admin_users (email, full_name, password_hash, is_active)
VALUES (
  'guilherme@roleentretenimento.com', 
  'Guilherme Role', 
  'admin123', -- Senha padrão que pode ser alterada no primeiro login
  true
)
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  full_name = 'Guilherme Role',
  password_hash = 'admin123';