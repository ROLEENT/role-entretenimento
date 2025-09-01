-- Create followers table for the FollowButton functionality
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.entity_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, user_id)
);

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Create policies for followers
CREATE POLICY "Users can view all followers" 
ON public.followers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow profiles" 
ON public.followers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow profiles" 
ON public.followers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_followers_profile_id ON public.followers(profile_id);
CREATE INDEX idx_followers_user_id ON public.followers(user_id);