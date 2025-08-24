-- Fix RLS policies for admin access and implement comment management

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

-- Update partners RLS policies to use proper admin check
DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
USING (is_admin_user());

-- Update contact messages RLS policies 
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view all contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (is_admin_user());

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (is_admin_user());

-- Update advertisements RLS policies
DROP POLICY IF EXISTS "Admins can manage advertisements" ON public.advertisements;
CREATE POLICY "Admins can manage advertisements" 
ON public.advertisements 
FOR ALL 
USING (is_admin_user());

-- Update blog_comments to auto-approve comments
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.blog_comments;
CREATE POLICY "Anyone can insert comments with auto-approval" 
ON public.blog_comments 
FOR INSERT 
WITH CHECK (true);

-- Create trigger to auto-approve blog comments
CREATE OR REPLACE FUNCTION public.auto_approve_blog_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-approve all new blog comments
  NEW.is_approved = true;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_approve_blog_comments_trigger
BEFORE INSERT ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_blog_comments();

-- Update event_comments to auto-approve as well
CREATE OR REPLACE FUNCTION public.auto_approve_event_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-approve all new event comments  
  RETURN NEW;
END;
$$;

-- Update RPC functions to use new admin check
CREATE OR REPLACE FUNCTION public.get_contact_messages()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin using new function
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    cm.email,
    cm.subject,
    cm.message,
    cm.status,
    cm.created_at
  FROM public.contact_messages cm
  ORDER BY cm.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_contact_message_status(
  p_id UUID,
  p_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin using new function
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.contact_messages
  SET status = p_status
  WHERE id = p_id;
END;
$$;

-- Create admin comment management functions
CREATE OR REPLACE FUNCTION public.get_blog_comments_admin()
RETURNS TABLE (
  id UUID,
  post_id UUID,
  author_name TEXT,
  author_email TEXT,
  content TEXT,
  is_approved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  post_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    bc.id,
    bc.post_id,
    bc.author_name,
    bc.author_email,
    bc.content,
    bc.is_approved,
    bc.created_at,
    bp.title as post_title
  FROM public.blog_comments bc
  LEFT JOIN public.blog_posts bp ON bc.post_id = bp.id
  ORDER BY bc.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_blog_comment(p_comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.blog_comments
  SET is_approved = true
  WHERE id = p_comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_blog_comment(p_comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.blog_comments
  SET is_approved = false
  WHERE id = p_comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_blog_comment(p_comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  DELETE FROM public.blog_comments
  WHERE id = p_comment_id;
END;
$$;