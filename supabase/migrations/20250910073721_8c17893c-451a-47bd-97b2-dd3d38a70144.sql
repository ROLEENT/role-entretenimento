-- Fix function search paths for security warnings
-- First remove the triggers, then the functions
DROP TRIGGER IF EXISTS update_comment_like_count_trigger ON public.comment_likes;
DROP TRIGGER IF EXISTS update_event_checkins_updated_at ON public.event_checkins;
DROP TRIGGER IF EXISTS update_event_reactions_updated_at ON public.event_reactions;

DROP FUNCTION IF EXISTS update_comment_like_count();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Function to update comment like count with secure search path
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.event_comments 
    SET like_count = like_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.event_comments 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update updated_at timestamp with secure search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_comment_like_count_trigger
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

CREATE TRIGGER update_event_checkins_updated_at
  BEFORE UPDATE ON public.event_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_reactions_updated_at
  BEFORE UPDATE ON public.event_reactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();