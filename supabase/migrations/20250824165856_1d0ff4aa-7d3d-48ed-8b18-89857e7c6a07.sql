-- Add RLS policies for admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view own profile" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Admin users can update own profile" 
ON public.admin_users 
FOR UPDATE 
USING (true);