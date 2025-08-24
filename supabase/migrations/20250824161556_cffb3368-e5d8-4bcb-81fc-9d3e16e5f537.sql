-- Add fiih@roleentretenimento.com to admin_users table
INSERT INTO public.admin_users (email, password_hash, full_name, is_active)
VALUES ('fiih@roleentretenimento.com', 'admin123', 'Fiih Role Entretenimento', true)
ON CONFLICT (email) DO NOTHING;