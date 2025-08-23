-- Fix the increment_post_views function to be more secure
DROP FUNCTION IF EXISTS public.increment_post_views(uuid);

CREATE OR REPLACE FUNCTION public.increment_post_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.blog_posts 
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id;
END;
$$;