-- Fix security definer view issue by dropping and recreating as regular view
DROP VIEW IF EXISTS public.blog_comments_public;

-- Create a secure view for public comment access that excludes emails
-- Using regular view (not security definer) with proper RLS
CREATE VIEW public.blog_comments_public AS 
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

-- Enable RLS on the view if needed (though views inherit from base table)
-- Grant access to the view
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;