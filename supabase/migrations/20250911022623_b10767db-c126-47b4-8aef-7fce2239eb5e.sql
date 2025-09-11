-- Enable RLS on user_roles table (Security Fix: RLS Disabled in Public)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles table
-- Users can only view their own role
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all user roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can insert/update user roles
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Log this security fix
INSERT INTO public.admin_audit_log (
  admin_email,
  action,
  table_name,
  new_values
) VALUES (
  'system-security-fix',
  'ENABLE_RLS',
  'user_roles',
  jsonb_build_object(
    'security_fix', 'RLS_DISABLED_IN_PUBLIC',
    'timestamp', NOW(),
    'description', 'Enabled Row Level Security on user_roles table'
  )
);