-- Update RLS policies to work with admin headers system

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can delete artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can update all artists" ON public.artists;

-- Create new policies that work with the existing admin system
CREATE POLICY "Admins can delete artists via header" 
ON public.artists 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Admins can update all artists via header" 
ON public.artists 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);