-- Create policy for users to update their own profile
CREATE POLICY "update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);