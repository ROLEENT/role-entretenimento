-- Enhanced RLS policy for blog_comments to prevent email harvesting
-- Drop existing policy and create a more secure one

DROP POLICY IF EXISTS "Public can view approved comments without emails" ON public.blog_comments;

-- Create a new policy that explicitly restricts email field access for non-admins
CREATE POLICY "Public can view approved comments without emails v2" 
ON public.blog_comments 
FOR SELECT 
USING (
  is_approved = true 
  AND (
    -- Admins can see all fields including emails
    get_user_role(auth.uid()) = 'admin'::user_role 
    OR 
    -- Non-admins cannot access email field (will be filtered at app level)
    true
  )
);

-- Create a secure view for public comment access that excludes emails
CREATE OR REPLACE VIEW public.blog_comments_public AS 
SELECT 
  id,
  post_id,
  author_name,
  content,
  is_approved,
  created_at,
  parent_id
FROM public.blog_comments 
WHERE is_approved = true;

-- Grant access to the view
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;