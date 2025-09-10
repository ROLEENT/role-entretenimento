-- Add attended field to event_checkins table
ALTER TABLE public.event_checkins 
ADD COLUMN IF NOT EXISTS attended boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create event_likes table for reactions/likes
CREATE TABLE IF NOT EXISTS public.event_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id, reaction_type)
);

-- Create event_reactions table for more detailed reactions
CREATE TABLE IF NOT EXISTS public.event_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('interested', 'going', 'maybe', 'not_going')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create comment_likes table for liking comments
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.event_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Add like_count to event_comments for performance
ALTER TABLE public.event_comments 
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_likes_event_id ON public.event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id ON public.event_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reactions_event_id ON public.event_reactions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reactions_user_id ON public.event_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_event_checkins_event_id ON public.event_checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON public.event_comments(event_id);

-- Enable RLS on new tables
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_likes
CREATE POLICY "Users can view all event likes" ON public.event_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own event likes" ON public.event_likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for event_reactions  
CREATE POLICY "Users can view all event reactions" ON public.event_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own event reactions" ON public.event_reactions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for comment_likes
CREATE POLICY "Users can view all comment likes" ON public.comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comment likes" ON public.comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- Function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to automatically update comment like counts
CREATE TRIGGER update_comment_like_count_trigger
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_event_checkins_updated_at
  BEFORE UPDATE ON public.event_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_reactions_updated_at
  BEFORE UPDATE ON public.event_reactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all engagement tables
ALTER TABLE public.event_likes REPLICA IDENTITY FULL;
ALTER TABLE public.event_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.comment_likes REPLICA IDENTITY FULL;
ALTER TABLE public.event_comments REPLICA IDENTITY FULL;
ALTER TABLE public.event_checkins REPLICA IDENTITY FULL;