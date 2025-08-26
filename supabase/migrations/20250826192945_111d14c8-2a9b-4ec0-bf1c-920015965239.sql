-- Create blog_post_revisions table if not exists
CREATE TABLE IF NOT EXISTS public.blog_post_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  revision_number integer NOT NULL DEFAULT 1,
  change_description text
);

-- Enable RLS
ALTER TABLE public.blog_post_revisions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage revisions" ON public.blog_post_revisions
  FOR ALL USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_post_id 
  ON public.blog_post_revisions(post_id);

CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_created_at 
  ON public.blog_post_revisions(created_at DESC);

-- Function to create revision when post is updated
CREATE OR REPLACE FUNCTION public.create_blog_post_revision()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create revision if content actually changed
  IF OLD.content_html IS DISTINCT FROM NEW.content_html 
     OR OLD.title IS DISTINCT FROM NEW.title 
     OR OLD.summary IS DISTINCT FROM NEW.summary THEN
    
    INSERT INTO public.blog_post_revisions (
      post_id,
      content_json,
      title,
      summary,
      created_by,
      revision_number,
      change_description
    )
    VALUES (
      NEW.id,
      jsonb_build_object(
        'content_html', NEW.content_html,
        'title', NEW.title,
        'summary', NEW.summary,
        'tags', NEW.tags,
        'status', NEW.status
      ),
      NEW.title,
      NEW.summary,
      auth.uid(),
      COALESCE((
        SELECT MAX(revision_number) + 1 
        FROM public.blog_post_revisions 
        WHERE post_id = NEW.id
      ), 1),
      'Auto-save revision'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS blog_post_revision_trigger ON public.blog_posts;
CREATE TRIGGER blog_post_revision_trigger
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_blog_post_revision();

-- Function to restore post revision
CREATE OR REPLACE FUNCTION public.restore_blog_post_revision(
  p_post_id uuid,
  p_revision_id uuid
)
RETURNS void AS $$
DECLARE
  revision_data jsonb;
  current_user_id uuid;
BEGIN
  -- Check admin access
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Get current user
  current_user_id := auth.uid();

  -- Get revision data
  SELECT content_json INTO revision_data
  FROM public.blog_post_revisions
  WHERE id = p_revision_id AND post_id = p_post_id;

  IF revision_data IS NULL THEN
    RAISE EXCEPTION 'Revision not found';
  END IF;

  -- Update the post with revision data
  UPDATE public.blog_posts
  SET 
    title = revision_data->>'title',
    summary = revision_data->>'summary',
    content_html = revision_data->>'content_html',
    tags = COALESCE((revision_data->>'tags')::text[], tags),
    updated_at = now()
  WHERE id = p_post_id;

  -- Create a new revision noting the restore
  INSERT INTO public.blog_post_revisions (
    post_id,
    content_json,
    title,
    summary,
    created_by,
    revision_number,
    change_description
  )
  VALUES (
    p_post_id,
    revision_data,
    revision_data->>'title',
    revision_data->>'summary',
    current_user_id,
    COALESCE((
      SELECT MAX(revision_number) + 1 
      FROM public.blog_post_revisions 
      WHERE post_id = p_post_id
    ), 1),
    'Restored from revision #' || (
      SELECT revision_number
      FROM public.blog_post_revisions
      WHERE id = p_revision_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;