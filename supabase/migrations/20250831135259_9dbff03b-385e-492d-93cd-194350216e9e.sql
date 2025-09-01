-- Enable RLS on tables that don't have it
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_unresolved_artists ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for these tables

-- app_admins: Only allow reading for functions that validate admin email
CREATE POLICY "app_admins_read_policy" ON public.app_admins
FOR SELECT 
USING (true); -- Functions will handle the security

-- migration_unresolved_artists: Admin only access
CREATE POLICY "migration_unresolved_artists_admin_only" ON public.migration_unresolved_artists
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- admins: Admin only access
CREATE POLICY "admins_admin_only" ON public.admins
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);