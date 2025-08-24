-- Insert admin user into approved_admins table
INSERT INTO public.approved_admins (email, approved_by, is_active)
VALUES ('admin@role.com.br', 'system', true)
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  approved_by = 'system';