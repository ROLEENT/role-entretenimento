-- Drop existing RLS policy and create a simpler one
DROP POLICY IF EXISTS "Allow read access to admin_users for authentication" ON public.admin_users;

-- Create a simple policy that allows reading admin_users for authentication checks
CREATE POLICY "admin_users_read_access" ON public.admin_users
FOR SELECT USING (true);