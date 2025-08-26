-- Ensure admin profile exists for the admin email
-- First, let's create a proper UUID for the admin
DO $$
DECLARE
    admin_uuid uuid := gen_random_uuid();
BEGIN
    -- Check if admin profile already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'admin@role.com.br') THEN
        INSERT INTO public.profiles (user_id, full_name, email, is_admin)
        VALUES (admin_uuid, 'Admin ROLE', 'admin@role.com.br', true);
    ELSE
        -- Update existing profile to be admin
        UPDATE public.profiles 
        SET is_admin = true 
        WHERE email = 'admin@role.com.br' AND is_admin = false;
    END IF;
END $$;