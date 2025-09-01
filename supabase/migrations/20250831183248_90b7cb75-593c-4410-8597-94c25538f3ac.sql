-- Add UPDATE policy for blog_posts
CREATE POLICY "Editors can update own posts" 
ON public.blog_posts 
FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Add DELETE policy for blog_posts  
CREATE POLICY "Editors can delete own posts"
ON public.blog_posts 
FOR DELETE 
USING (auth.uid() = author_id);

-- Add admin policies for full management
CREATE POLICY "Admins can update all posts"
ON public.blog_posts
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'::user_role
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

CREATE POLICY "Admins can delete all posts"
ON public.blog_posts
FOR DELETE  
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'::user_role
));