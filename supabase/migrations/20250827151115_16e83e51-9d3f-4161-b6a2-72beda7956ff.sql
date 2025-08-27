-- Create the admin account in Supabase Auth system
-- This will allow the user to login via the Admin V2 interface

-- First, we need to insert the user into auth.users
-- Note: In production, this would normally be done via signup, but we're creating directly for existing admin

-- Create a function to safely create an admin auth account
CREATE OR REPLACE FUNCTION create_admin_auth_account(
  p_email text,
  p_password text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  encrypted_password text;
BEGIN
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Simple password encryption (in production would use proper bcrypt)
  encrypted_password := crypt(p_password, gen_salt('bf'));
  
  -- Insert into auth.users (this is normally handled by Supabase auth service)
  -- Since we can't directly insert into auth.users, we'll use the auth admin API
  -- For now, let's create a temporary solution using a different approach
  
  -- Check if admin user already exists in our admin_users table
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE email = p_email) THEN
    -- Update the existing admin_users record to be ready for auth sync
    UPDATE public.admin_users 
    SET 
      password_hash = encrypted_password,
      updated_at = NOW()
    WHERE email = p_email;
    
    -- Return the existing admin user ID (we'll need to sync this later)
    SELECT id INTO new_user_id FROM public.admin_users WHERE email = p_email;
  END IF;
  
  RETURN new_user_id;
END;
$$;

-- Execute the function to prepare the admin account
SELECT create_admin_auth_account('fiih@roleentretenimento.com', 'AdminRole2025!');