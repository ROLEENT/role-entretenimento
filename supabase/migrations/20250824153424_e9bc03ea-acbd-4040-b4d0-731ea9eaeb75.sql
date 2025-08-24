-- Create RPC functions for contact messages and comment management
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

-- Update blog_comments to auto-approve comments
UPDATE public.blog_comments SET is_approved = true WHERE is_approved = false;

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

DROP TRIGGER IF EXISTS auto_approve_blog_comments_trigger ON public.blog_comments;
CREATE TRIGGER auto_approve_blog_comments_trigger
BEFORE INSERT ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_blog_comments();

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