-- Fix the critical SECURITY DEFINER view issues and remaining warnings

-- 1. Fix the views to not use SECURITY DEFINER (they were implicitly created with it)
DROP VIEW IF EXISTS public.blog_comments_safe;
DROP VIEW IF EXISTS public.organizers_public;

-- Create regular views without SECURITY DEFINER
CREATE VIEW public.blog_comments_safe AS
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

CREATE VIEW public.organizers_public AS
SELECT 
  id,
  name,
  site,
  instagram,
  created_at,
  updated_at
FROM public.organizers;

-- Grant proper access
GRANT SELECT ON public.blog_comments_safe TO anon, authenticated;
GRANT SELECT ON public.organizers_public TO anon, authenticated;

-- 2. Fix remaining functions without search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role user_role := 'editor';
BEGIN
  -- Check if email is in approved_admins and assign admin role
  IF EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = NEW.email AND is_active = true
  ) THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    NEW.email,
    user_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar following_count do seguidor
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Incrementar followers_count do seguido
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar following_count do seguidor
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    
    -- Decrementar followers_count do seguido
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_highlight_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE highlights 
    SET like_count = like_count + 1 
    WHERE id = NEW.highlight_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE highlights 
    SET like_count = GREATEST(0, like_count - 1) 
    WHERE id = OLD.highlight_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;