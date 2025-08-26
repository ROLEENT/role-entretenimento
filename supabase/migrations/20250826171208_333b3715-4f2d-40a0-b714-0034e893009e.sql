-- Reset admin user credentials and ensure proper setup
-- First, update the admin user's email confirmation status
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'fiih@roleentretenimento.com';

-- Reset password for admin user (they will need to reset via email)
-- Remove any locked status and reset login attempts
UPDATE public.admin_users 
SET login_attempts = 0,
    locked_until = NULL,
    last_login_at = NULL,
    updated_at = NOW()
WHERE email = 'fiih@roleentretenimento.com';

-- Ensure admin role is properly set in profiles
INSERT INTO public.profiles (user_id, email, role, is_admin, full_name)
SELECT 
  au.id,
  au.email,
  'admin'::user_role,
  true,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Admin ROLE')
FROM auth.users au
WHERE au.email = 'fiih@roleentretenimento.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin'::user_role,
  is_admin = true,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Clean up any expired admin sessions
DELETE FROM public.admin_sessions 
WHERE expires_at < NOW();

-- Ensure admin exists in approved_admins
INSERT INTO public.approved_admins (email, approved_by, is_active)
VALUES ('fiih@roleentretenimento.com', 'system', true)
ON CONFLICT (email) DO UPDATE SET 
  is_active = true,
  created_at = NOW();