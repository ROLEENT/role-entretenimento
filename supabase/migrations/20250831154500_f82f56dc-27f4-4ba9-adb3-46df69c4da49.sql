-- Create RLS policy for admin_users table to allow read access
CREATE POLICY "Allow read access to admin_users for authentication" ON public.admin_users
FOR SELECT USING (
  -- Allow service role access (for authentication checks)
  auth.role() = 'service_role' OR
  -- Allow authenticated users to check if an email is an admin
  (auth.uid() IS NOT NULL)
);