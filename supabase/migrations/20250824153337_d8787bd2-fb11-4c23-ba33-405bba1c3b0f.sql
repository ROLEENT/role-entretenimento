-- Create contact messages table first
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS on contact messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Update profiles table to ensure admin access works correctly
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'fiih@roleentretenimento.com' OR email = 'guilherme@roleentretenimento.com';

-- Create function to check admin status properly
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()),
    false
  )
$$;

-- Create contact messages RLS policies 
CREATE POLICY "Admins can view all contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Anyone can insert contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (is_admin_user());

-- Update partners RLS policies to use proper admin check
DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
USING (is_admin_user());

-- Update advertisements RLS policies
DROP POLICY IF EXISTS "Admins can manage advertisements" ON public.advertisements;
CREATE POLICY "Admins can manage advertisements" 
ON public.advertisements 
FOR ALL 
USING (is_admin_user());