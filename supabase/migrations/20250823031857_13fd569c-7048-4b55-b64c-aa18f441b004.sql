-- Create approved_admins table for admin security
CREATE TABLE public.approved_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  approved_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.approved_admins ENABLE ROW LEVEL SECURITY;

-- Only admins can manage approved admins
CREATE POLICY "Admins can manage approved admins" 
ON public.approved_admins 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Insert the main admin email
INSERT INTO public.approved_admins (email, approved_by) VALUES 
('fiih@roleentretenimento.com', 'system');

-- Create comments table for blog posts
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments" 
ON public.blog_comments 
FOR SELECT 
USING (is_approved = true);

-- Anyone can insert comments (pending approval)
CREATE POLICY "Anyone can insert comments" 
ON public.blog_comments 
FOR INSERT 
WITH CHECK (true);

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments" 
ON public.blog_comments 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create likes table for blog posts
CREATE TABLE public.blog_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_email)
);

-- Enable RLS
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view likes" 
ON public.blog_likes 
FOR SELECT 
USING (true);

-- Anyone can insert/delete their own likes
CREATE POLICY "Anyone can manage their likes" 
ON public.blog_likes 
FOR ALL
USING (true);

-- Add indexes for performance
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_approved ON public.blog_comments(is_approved);
CREATE INDEX idx_blog_likes_post_id ON public.blog_likes(post_id);