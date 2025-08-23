-- Create RPC function to increment post views
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blog_posts 
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id;
END;
$$;