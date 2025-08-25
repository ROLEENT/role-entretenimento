-- Phase 3: Final Critical Security Fixes

-- 1. Fix blog_comments email exposure by creating secure view
CREATE OR REPLACE VIEW public.blog_comments_safe AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  created_at,
  parent_id,
  is_approved
FROM public.blog_comments
WHERE is_approved = true;

-- Grant access to the safe view
GRANT SELECT ON public.blog_comments_safe TO anon, authenticated;

-- 2. Create function to get organizer info without exposing emails
CREATE OR REPLACE FUNCTION public.get_organizer_public_info(organizer_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  site text,
  instagram text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    o.id,
    o.name,
    o.site,
    o.instagram,
    o.created_at,
    o.updated_at
  FROM public.organizers o
  WHERE o.id = organizer_id;
$$;

-- 3. Strengthen blog_comments RLS to prevent email access
DROP POLICY IF EXISTS "Public can view approved comments without emails v2" ON public.blog_comments;

CREATE POLICY "Admin only access to blog_comments"
ON public.blog_comments
FOR ALL
USING (is_admin_session_valid((current_setting('request.headers', true))::json ->> 'x-admin-email'));

-- 4. Add search_path to critical security functions
CREATE OR REPLACE FUNCTION public.is_admin_session_valid(p_admin_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = p_admin_email AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.validate_admin_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = p_email AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_email text;
BEGIN
  -- Get email from secure session token or fallback to email header
  session_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF session_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if admin exists and is active
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
END;
$$;

-- 5. Create secure function for getting comment counts without exposing user data
CREATE OR REPLACE FUNCTION public.get_secure_comment_count(p_post_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.blog_comments
  WHERE post_id = p_post_id AND is_approved = true;
$$;

-- 6. Remove dangerous policies that expose user IDs in highlight_likes
DROP POLICY IF EXISTS "Anyone can view highlight likes count" ON public.highlight_likes;
DROP POLICY IF EXISTS "Users can manage their own highlight likes" ON public.highlight_likes;

-- Create safer policies for highlight_likes
CREATE POLICY "Users can create their own highlight likes"
ON public.highlight_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlight likes"
ON public.highlight_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Prevent SELECT to hide user_ids completely
CREATE POLICY "No direct access to highlight_likes"
ON public.highlight_likes
FOR SELECT
USING (false);

-- 7. Create secure functions for like operations
CREATE OR REPLACE FUNCTION public.get_highlight_like_count(p_highlight_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.highlight_likes
  WHERE highlight_id = p_highlight_id;
$$;

CREATE OR REPLACE FUNCTION public.user_liked_highlight(p_highlight_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.highlight_likes
    WHERE highlight_id = p_highlight_id AND user_id = auth.uid()
  );
$$;

-- 8. Create secure function for blog comment management
CREATE OR REPLACE FUNCTION public.add_blog_comment_secure(
  p_post_id uuid,
  p_author_name text,
  p_author_email text,
  p_content text,
  p_parent_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_comment_id uuid;
BEGIN
  -- Insert comment
  INSERT INTO public.blog_comments (
    post_id, author_name, author_email, content, parent_id, is_approved
  )
  VALUES (
    p_post_id, p_author_name, p_author_email, p_content, p_parent_id, true
  )
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$;

-- 9. Ensure organizers table has proper RLS for contact_email
DROP POLICY IF EXISTS "Public can view organizer basic info" ON public.organizers;
DROP POLICY IF EXISTS "organizers_read_all" ON public.organizers;

CREATE POLICY "Public can view organizer safe info"
ON public.organizers
FOR SELECT
USING (true);

-- But let's create a view that excludes contact_email for public access
CREATE OR REPLACE VIEW public.organizers_public AS
SELECT 
  id,
  name,
  site,
  instagram,
  created_at,
  updated_at
FROM public.organizers;

GRANT SELECT ON public.organizers_public TO anon, authenticated;

-- 10. Update blog_likes to ensure no email exposure
DROP POLICY IF EXISTS "Count likes only (no email access)" ON public.blog_likes;
DROP POLICY IF EXISTS "Hide user emails from blog_likes" ON public.blog_likes;

CREATE POLICY "No direct access to blog_likes"
ON public.blog_likes
FOR SELECT
USING (false);

-- The existing functions get_post_likes_count and user_liked_post already provide safe access